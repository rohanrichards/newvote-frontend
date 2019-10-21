import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';
import { ProposalService } from '@app/core/http/proposal/proposal.service';

import { optimizeImage } from '@app/shared/helpers/cloudinary';
import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { Suggestion } from '@app/core/models/suggestion.model';
import { OrganizationService } from '@app/core';
import { assign, cloneDeep } from 'lodash';
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';
import { SolutionQuery } from '@app/core/http/solution/solution.query';
import { VotesQuery } from '@app/core/http/vote/vote.query';
import { AdminService } from '@app/core/http/admin/admin.service';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-solution',
    templateUrl: './solution-view.component.html',
    styleUrls: ['./solution-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class SolutionViewComponent implements OnInit {

    solution: Solution;
    isLoading: boolean;
    loadingState: string;
    handleImageUrl = optimizeImage;
    organization: any;
    suggestions: any[];
    proposals: any[];
    proposals$: Observable<any>;
    suggestions$: Observable<any>;

    constructor(
        private organizationService: OrganizationService,
        private suggestionService: SuggestionService,
        private stateService: StateService,
        private solutionService: SolutionService,
        private voteService: VoteService,
        private proposalService: ProposalService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private suggestionQuery: SuggestionQuery,
        private solutionQuery: SolutionQuery,
        private voteQuery: VotesQuery,
        private admin: AdminService,
        private proposalQuery: ProposalQuery
    ) { }

    ngOnInit() {
        this.organizationService.get()
            .subscribe((org) => this.organization = org);
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state;
        });

        this.stateService.setLoadingState(AppState.loading);

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id');
            this.getSolution(ID);
            this.getProposals();
            this.subscribeToSolutionStore(ID);
        });

        this.getSuggestions();
    }

    getSolution(id: string) {
        const isModerator = this.auth.isModerator();
        const options = { 'showDeleted': isModerator ? true : '' };

        this.solutionService.view({
            id: id,
            params: options
        })
            .subscribe(
                (solution: Solution) => {
                    this.meta.updateTags(
                        {
                            title: solution.title,
                            appBarTitle: 'View Solution',
                            description: solution.description,
                            image: solution.imageUrl
                        });
                },
                (err) => this.stateService.setLoadingState(AppState.serverError)
            );
    }

    getProposals() {
        this.proposalService.list({})
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    getSuggestions() {
        const isModerator = this.auth.isModerator();

        this.suggestionService.list({
            forceUpdate: true,
            params: {
                'showDeleted': isModerator ? true : ''
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    subscribeToSolutionStore(id: string) {
        // Need to handle both instances whether a link is via _id or slug
        // old entities will have no slug until updated
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            this.solutionQuery.selectEntity(id)
                .subscribe((solution: Solution) => {
                    if (!solution) return false;
                    this.solution = solution;
                    this.subscribeToProposalStore(solution._id);
                    this.subscribeToSuggestionStore(solution._id);
                    this.stateService.setLoadingState(AppState.complete);
                })
        } else {
            this.solutionQuery.selectAll({
                filterBy: (entity) => entity.slug === id
            })
                .subscribe((solutions: Solution[]) => {
                    if (!solutions.length) return false;
                    this.solution = solutions[0];
                    this.subscribeToProposalStore(solutions[0]._id);
                    this.subscribeToSuggestionStore(solutions[0]._id);
                    this.stateService.setLoadingState(AppState.complete);
                })
        }
    }

    subscribeToSuggestionStore(id: string) {
        this.suggestions$ = this.suggestionQuery.selectAll({
            filterBy: entity => entity.parent === id
        })
    }

    subscribeToProposalStore(id: string) {
        this.proposals$ = this.proposalQuery.filterBySolutionId(id);
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true;
        const { item, voteValue } = voteData;
        const vote = new Vote(item._id, model, voteValue);
        const existingVote = item.votes.currentUser;

        if (existingVote) {
            vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
                (res) => {
                    this.updateEntityVoteData(item, model, res.voteValue);
                    this.openSnackBar('Your vote was recorded', 'OK');
                },
                (error) => {
                    if (error.status === 401) {
                        this.openSnackBar('You must be logged in to vote', 'OK');
                    } else {
                        this.openSnackBar('There was an error recording your vote', 'OK');
                    }
                }
            );
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        });
    }

    populateSuggestion() {
        const { _id, title } = this.solution;
        const suggestionParentInfo = {
            _id,
            parentTitle: title,
            parentType: 'Solution',
            type: 'action'
        }

        this.router.navigateByUrl('/suggestions/create', {
            state: {
                ...suggestionParentInfo
            }
        })
    }

    handleSuggestionSubmit(formData: any) {
        const suggestion = <Suggestion>formData;
        suggestion.organizations = this.organization;

        suggestion.parent = this.solution._id;
        suggestion.parentType = 'Solution';
        suggestion.parentTitle = this.solution.title;

        this.suggestionService.create({ entity: suggestion })
            .subscribe(t => {
                this.openSnackBar('Succesfully created', 'OK');
            },
                (error) => {
                    this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
                })
    }

    updateEntityVoteData(entity: any, model: string, voteValue: number) {
        this.voteQuery.selectEntity(entity._id)
            .pipe(
                take(1)
            )
            .subscribe(
                (voteObj) => {
                    // Create a new entity object with updated vote values from
                    // vote object on store + voteValue from recent vote
                    const updatedEntity = {
                        votes: {
                            ...voteObj,
                            currentUser: {
                                voteValue: voteValue === 0 ? false : voteValue
                            }
                        }
                    };

                    if (model === "Solution") {
                        return this.solutionService.updateSolutionVote(entity._id, updatedEntity);
                    }

                    if (model === "Proposal") {
                        return this.proposalService.updateProposalVote(entity._id, updatedEntity);
                    }

                    if (model === "Suggestion") {
                        return this.suggestionService.updateSuggestionVote(entity._id, updatedEntity);
                    }
                },
                (err) => err
            )

    }

}

