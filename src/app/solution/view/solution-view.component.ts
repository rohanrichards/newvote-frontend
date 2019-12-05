import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take, tap } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Solution } from '@app/core/models/solution.model'
import { Vote } from '@app/core/models/vote.model'
import { ProposalService } from '@app/core/http/proposal/proposal.service'

import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { Suggestion } from '@app/core/models/suggestion.model'
import { OrganizationService } from '@app/core'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { Observable } from 'rxjs'
import { ToastService } from '@app/core/toast/toast.service'

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
        private toast: ToastService,
        private meta: MetaService,
        private suggestionQuery: SuggestionQuery,
        private solutionQuery: SolutionQuery,
        private voteQuery: VotesQuery,
        private admin: AdminService,
        private proposalQuery: ProposalQuery
    ) { }

    ngOnInit() {
        this.organizationService.get()
            .subscribe((org) => { this.organization = org })
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.getSolution(ID)
            this.getProposals()
            this.getSuggestions()
            this.subscribeToSolutionStore(ID)
        })

    }

    getSolution(id: string) {
        const isModerator = this.auth.isModerator()
        const options = { showDeleted: isModerator ? true : '' }

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
                        })
                },
                () => this.stateService.setLoadingState(AppState.error)
            )
    }

    getProposals() {
        this.proposalService.list({})
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    getSuggestions() {
        const isModerator = this.auth.isModerator()

        this.suggestionService.list({
            params: {
                showDeleted: isModerator ? true : ''
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    subscribeToSolutionStore(id: string) {
        this.solutionQuery.getSolutionWithSlug(id)
            .subscribe((solutions: Solution[]) => {
                if (!solutions.length) return false
                this.solution = solutions[0]
                this.subscribeToProposalStore(solutions[0]._id)
                this.subscribeToSuggestionStore(solutions[0]._id)
                this.stateService.setLoadingState(AppState.complete)
            })
    }

    subscribeToSuggestionStore(id: string) {
        this.suggestions$ = this.suggestionQuery.selectAll({
            filterBy: entity => entity.parent === id
        })

        this.suggestions$.subscribe((res) => {
            if (!res) return false
            this.suggestions = res
        })
    }

    subscribeToProposalStore(id: string) {
        this.proposals$ = this.proposalQuery.filterBySolutionId(id)

        this.proposals$.subscribe((res) => {
            if (!res) return false
            this.proposals = res
        })
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
        const { item, voteValue } = voteData
        const vote = new Vote(item._id, model, voteValue)
        const existingVote = item.votes.currentUser

        if (existingVote) {
            vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => {
                    this.updateEntityVoteData(item, model, res.voteValue)
                    this.toast.openSnackBar('Your vote was recorded', 'OK')
                },
                (error) => {
                    if (error.status === 401) {
                        this.toast.openSnackBar('You must be logged in to vote', 'OK')
                    } else {
                        this.toast.openSnackBar('There was an error recording your vote', 'OK')
                    }
                }
            )
    }

    populateSuggestion() {
        const { _id, title } = this.solution
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
        const suggestion = formData as Suggestion
        suggestion.organizations = this.organization

        suggestion.parent = this.solution._id
        suggestion.parentType = 'Solution'
        suggestion.parentTitle = this.solution.title

        this.suggestionService.create({ entity: suggestion })
            .subscribe(
                () => {
                    this.toast.openSnackBar('Succesfully created', 'OK')
                },
                (error) => {
                    this.toast.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                }
            )
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
                    }

                    if (model === 'Solution') {
                        return this.solutionService.updateSolutionVote(entity._id, updatedEntity)
                    }

                    if (model === 'Proposal') {
                        return this.proposalService.updateProposalVote(entity._id, updatedEntity)
                    }

                    if (model === 'Suggestion') {
                        return this.suggestionService.updateSuggestionVote(entity._id, updatedEntity)
                    }
                },
                (err) => err
            )

    }

}
