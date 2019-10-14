import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, take, filter } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { IProposal } from '@app/core/models/proposal.model';
import { Proposal } from '@app/core/models/proposal.model';
import { Vote } from '@app/core/models/vote.model';
import { optimizeImage } from '@app/shared/helpers/cloudinary';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { Suggestion } from '@app/core/models/suggestion.model';
import { OrganizationService } from '@app/core';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';

import { assign } from 'lodash';
import { VotesQuery } from '@app/core/http/vote/vote.query';
import { AdminService } from '@app/core/http/admin/admin.service';

@Component({
    selector: 'app-proposal',
    templateUrl: './proposal-view.component.html',
    styleUrls: ['./proposal-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class ProposalViewComponent implements OnInit {

    proposal: Proposal;
    proposals: Array<Proposal>;
    isLoading: boolean;
    loadingState: string;
    handleImageUrl = optimizeImage;
    organization: any;
    suggestions: any[];

    constructor(
        private organizationService: OrganizationService,
        private suggestionService: SuggestionService,
        private stateService: StateService,
        private proposalService: ProposalService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private proposalQuery: ProposalQuery,
        private suggestionQuery: SuggestionQuery,
        private voteQuery: VotesQuery,
        public admin: AdminService
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
            this.subscribeToProposalStore(ID);
            this.subscribeToSuggestionStore(ID);
            this.getProposal(ID);
            this.getSuggestions(ID);
        });
    }

    subscribeToSuggestionStore(id: string) {
        this.suggestionQuery.suggestions$
            .pipe(
                filter((entity: any) => entity.parent === id)
            )
            .subscribe((suggestions: Suggestion[]) => {
                this.suggestions = suggestions;
            })

    }

    subscribeToProposalStore(id: string) {
        this.proposalQuery.selectEntity(id)
            .subscribe((proposal: Proposal) => {
                if (!proposal) return false;
                this.proposal = proposal;
                return this.stateService.setLoadingState(AppState.complete);
            })
    }

    getSuggestions(id: string) {
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

    getProposal(id: string, forceUpdate?: boolean) {
        this.proposalService.view({ id: id, orgs: [] })
            .subscribe(
                (proposal: Proposal) => {
                    this.meta.updateTags(
                        {
                            title: `${proposal.title}`,
                            appBarTitle: 'View Action',
                            description: proposal.description,
                            image: proposal.imageUrl
                        });
                },
                (error) => {
                    return this.stateService.setLoadingState(AppState.serverError);
                }
            );
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true;
        const { item, voteValue } = voteData;
        const vote = new Vote(item._id, 'Proposal', voteValue);
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
        const { _id, title } = this.proposal;
        const suggestionParentInfo = {
            _id,
            parentTitle: title,
            parentType: 'Action',
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

        suggestion.parent = this.proposal._id;
        suggestion.parentType = 'Action';
        suggestion.parentTitle = this.proposal.title;

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
