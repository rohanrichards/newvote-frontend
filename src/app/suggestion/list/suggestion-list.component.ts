import { Component, OnInit } from '@angular/core'
import { finalize, take } from 'rxjs/operators'
import { ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Suggestion } from '@app/core/models/suggestion.model'
import { Vote } from '@app/core/models/vote.model'

import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { Observable } from 'rxjs'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion-list.component.html',
    styleUrls: ['./suggestion-list.component.scss'],
    animations: [trigger('fadeIn', fadeIn(':enter'))],
})
export class SuggestionListComponent implements OnInit {
    loadingState: string
    suggestions: Array<Suggestion>
    suggestions$: Observable<any>
    isLoading: boolean
    headerTitle = 'Make a new contribution'
    headerText =
        "Suggestions are a way for you to contribute to the discussion. \
        Start by checking if your idea already exists in the suggestion list below (vote on it to increase exposure). \
        If your idea doesn't already exist, use the create button below, the community leader will be notified."

    headerButtons = [
        {
            text: 'New Suggestion',
            color: 'warn',
            routerLink: '/suggestions/create',
            role: 'user',
        },
    ]

    stepsArray = [...JoyRideSteps]

    constructor(
        private suggestionService: SuggestionService,
        private suggestionQuery: SuggestionQuery,
        private stateService: StateService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private voteQuery: VotesQuery,
        public admin: AdminService,
        private route: ActivatedRoute,
        private authQuery: AuthenticationQuery
    ) {}

    ngOnInit() {
        this.stateService.setLoadingState(AppState.loading)
        this.getSuggestions()
        this.fetchData()

        this.meta.updateTags({
            title: 'All Suggestions',
            description: 'Showing all suggestions.',
        })

        this.stateService.loadingState$.subscribe(
            (res: any) => {
                this.loadingState = res
            },
            err => err,
        )
    }

    getSuggestions() {
        this.suggestions$ = this.suggestionQuery.getUsersSuggestions()
    }

    fetchData() {
        const isModerator = this.authQuery.isModerator()
        // let id;
        // Send user data so we can return only the users suggestions
        // if (this.auth.credentials && this.auth.credentials.user) {
        //     id = this.auth.credentials.user._id
        // }

        const options = {
            params: {
                showDeleted: isModerator ? true : '',
            },
        }

        this.suggestionService
            .list(options)
            .subscribe(
                () => this.stateService.setLoadingState(AppState.complete),
                () => this.stateService.setLoadingState(AppState.error),
            )
    }

    onVote(voteData: any, model = 'Suggestion') {
        this.isLoading = true
        const { item, voteValue } = voteData
        const vote = new Vote(item._id, 'Suggestion', voteValue)
        const existingVote = item.votes.currentUser

        if (existingVote) {
            vote.voteValue =
                existingVote.voteValue === voteValue ? 0 : voteValue
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
}
