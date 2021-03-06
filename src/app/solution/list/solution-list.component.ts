import { Component, OnInit } from '@angular/core'
import { finalize, take, map } from 'rxjs/operators'
import { Router, ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Solution } from '@app/core/models/solution.model'
import { Vote } from '@app/core/models/vote.model'

import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { OrganizationService } from '@app/core'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { forkJoin, Observable } from 'rxjs'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { Proposal } from '@app/core/models/proposal.model'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { FormControl } from '@angular/forms'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { AllEntityQuery } from '@app/core/http/mediators/entity.query'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Component({
    selector: 'app-solution',
    templateUrl: './solution-list.component.html',
    styleUrls: ['./solution-list.component.scss'],
    animations: [trigger('fadeIn', fadeIn(':enter'))],
})
export class SolutionListComponent implements OnInit {
    solutions$: Observable<any[]>
    suggestions$: Observable<any[]>
    loadingState: string
    solutions: Array<any>
    isLoading: boolean
    headerTitle = 'Browse By Solution'
    headerText =
        'Solutions are the decisions that you think your community should make.'
    headerButtons = [
        {
            text: 'New Solution',
            color: 'warn',
            routerLink: '/solutions/create',
            role: 'admin',
        },
        {
            text: 'Make Suggestion',
            color: 'warn',
            routerLink: '/suggestions/create',
            role: 'user',
            params: { type: 'solution' },
        },
    ]

    stepsArray = [...JoyRideSteps]

    suggestions: Array<any>
    organization: any
    sort: string
    isVerified: boolean

    constructor(
        private organizationService: OrganizationService,
        private stateService: StateService,
        private solutionService: SolutionService,
        private suggestionService: SuggestionService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private suggestionQuery: SuggestionQuery,
        private solutionQuery: SolutionQuery,
        private proposalService: ProposalService,
        private voteQuery: VotesQuery,
        public admin: AdminService,
        private access: AccessControlQuery,
        private entityVotes: EntityVotesQuery,
        private authQuery: AuthenticationQuery,
    ) {}

    ngOnInit() {
        this.subscribeToSuggestionStore()
        this.subscribeToSolutionStore()

        this.organizationService.get().subscribe(org => {
            this.organization = org
        })

        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.access.isCommunityVerified$.subscribe((verified: boolean) => {
            this.isVerified = verified
        })

        this.stateService.setLoadingState(AppState.loading)

        this.meta.updateTags({
            title: 'All Solutions',
            description:
                'Solutions are the decisions that you think your community should make.',
        })

        this.fetchData()
    }

    fetchData() {
        const isModerator = this.authQuery.isModerator()
        const options = { showDeleted: isModerator ? true : '' }

        const suggestionObs: Observable<
            Suggestion[]
        > = this.suggestionService.list({ params: options })
        const proposalObs: Observable<Proposal[]> = this.proposalService.list({
            params: options,
        })
        const solutionObs: Observable<Solution[]> = this.solutionService.list({
            params: options,
        })

        forkJoin([suggestionObs, proposalObs, solutionObs]).subscribe(
            () => this.stateService.setLoadingState(AppState.complete),
            () => this.stateService.setLoadingState(AppState.error),
        )
    }

    subscribeToSolutionStore() {
        this.solutions$ = this.entityVotes.getManySolutions()

        this.solutions$.subscribe(res => {
            if (!res) return false
            this.solutions = res
        })
    }

    subscribeToSuggestionStore() {
        this.suggestions$ = this.entityVotes.getManySuggestions(
            'solution',
            'type',
        )

        this.suggestions$.subscribe((suggestions: ISuggestion[]) => {
            if (!suggestions) return false
            this.suggestions = suggestions
        })
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
        const {
            item,
            voteValue,
            item: { votes: { currentUser = false } = false },
        } = voteData
        const vote = new Vote(item._id, model, voteValue)
        if (currentUser) {
            vote.voteValue = currentUser.voteValue === voteValue ? 0 : voteValue
        }

        this.voteService
            .create({ entity: vote })
            .pipe(
                finalize(() => {
                    this.isLoading = false
                }),
            )
            .subscribe(
                res => {
                    this.admin.openSnackBar('Your vote was recorded', 'OK')
                },
                error => {
                    if (error.status === 401) {
                        this.admin.openSnackBar(
                            'You must be logged in to vote',
                            'OK',
                        )
                    } else {
                        this.admin.openSnackBar(
                            'There was an error recording your vote',
                            'OK',
                        )
                    }
                },
            )
    }

    handleSuggestionSubmit(formData: any) {
        const suggestion = formData as Suggestion
        suggestion.organizations = this.organization

        this.suggestionService.create({ entity: suggestion }).subscribe(
            () => {
                this.admin.openSnackBar('Succesfully created', 'OK')
            },
            error => {
                this.admin.openSnackBar(
                    `Something went wrong: ${error.status} - ${error.statusText}`,
                    'OK',
                )
            },
        )
    }

    sortSolutionsBy(event: any) {
        const { value } = event
        this.solutionService.updateFilter(value)
    }
}
