import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take, tap } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
import { MatSnackBar } from '@angular/material'
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
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'

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
    isVerified: boolean

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
        private proposalQuery: ProposalQuery,
        public authQuery: AuthenticationQuery,
        public repQuery: RepQuery,
        private access: AccessControlQuery,
        private entityVotes: EntityVotesQuery
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

        this.access.isCommunityVerified$
            .subscribe((verified: boolean) => {
                this.isVerified = verified
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
        this.proposals$ = this.entityVotes.proposalVotes$(id)

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
                    this.openSnackBar('Your vote was recorded', 'OK')
                },
                (error) => {
                    if (error.status === 401) {
                        this.openSnackBar('You must be logged in to vote', 'OK')
                    } else {
                        this.openSnackBar('There was an error recording your vote', 'OK')
                    }
                }
            )
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
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
                    this.openSnackBar('Succesfully created', 'OK')
                },
                (error) => {
                    this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                }
            )
    }

}
