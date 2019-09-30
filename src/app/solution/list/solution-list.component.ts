import { Component, OnInit } from '@angular/core'
import { finalize, take, filter, map } from 'rxjs/operators'
import { Router, ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material'
import { differenceWith } from 'lodash'
import { isEqual, assign } from 'lodash'

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
import { Suggestion } from '@app/core/models/suggestion.model'
import { OrganizationService } from '@app/core'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { forkJoin, Observable } from 'rxjs'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { Proposal } from '@app/core/models/proposal.model'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'

@Component({
    selector: 'app-solution',
    templateUrl: './solution-list.component.html',
    styleUrls: ['./solution-list.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class SolutionListComponent implements OnInit {

    solutions$: Observable<any[]>;
    suggestions$: Observable<any[]>;
    loadingState: string;
    solutions: Array<any>;
    isLoading: boolean;
    headerTitle = 'Browse By Solution';
    headerText = 'Solutions are the decisions that you think your community should make.';
    headerButtons = [{
        text: 'New Solution',
        color: 'warn',
        routerLink: '/solutions/create',
        role: 'admin'
    },
    {
        text: 'Make Suggestion',
        color: 'warn',
        routerLink: '/suggestions/create',
        role: 'user',
        params: { type: 'solution' }
    }];

    stepsArray = [...JoyRideSteps];

    suggestions: Array<any>;
    organization: any;

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
        public admin: AdminService
    ) { }

    ngOnInit() {
        this.subscribeToSuggestionStore()
        this.subscribeToSolutionStore()

        this.organizationService.get()
            .subscribe((org) => this.organization = org)

        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.meta.updateTags(
            {
                title: 'All Solutions',
                description: 'Solutions are the decisions that you think your community should make.'
            })

        this.fetchData()
    }

    fetchData() {
        const isOwner = this.auth.isOwner()
        const options = { 'showDeleted': isOwner ? true : '' }

        const suggestionObs: Observable<Suggestion[]> = this.suggestionService.list({ params: options })
        const proposalObs: Observable<Proposal[]> = this.proposalService.list({ params: options })
        const solutionObs: Observable<Solution[]> = this.solutionService.list({ params: options })

        forkJoin([
            suggestionObs,
            proposalObs,
            solutionObs
        ])
            .subscribe(
                response => this.stateService.setLoadingState(AppState.complete),
                err => this.stateService.setLoadingState(AppState.serverError)
            )
    }

    subscribeToSolutionStore() {
        this.solutions$ = this.solutionQuery.selectSolutions()
    }

    subscribeToSuggestionStore() {
        this.suggestions$ = this.suggestionQuery.suggestions$
            .pipe(
                map((suggestions) => {
                    return suggestions.filter((suggestion) => suggestion.type === 'solution')
                }),
            )
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
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
                (res) => {
                    this.updateEntityVoteData(item, model, res.voteValue)
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
        const suggestion = <Suggestion>formData
        suggestion.organizations = this.organization

        this.suggestionService.create({ entity: suggestion })
            .subscribe(t => {
                this.openSnackBar('Succesfully created', 'OK')
            },
                (error) => {
                    this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
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
