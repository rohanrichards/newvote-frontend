import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
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
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { ToastService } from '@app/core/toast/toast.service'

import { assign } from 'lodash'

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion-view.component.html',
    styleUrls: ['./suggestion-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class SuggestionViewComponent implements OnInit {

    suggestion: Suggestion;
    suggestions: Array<Suggestion>;
    isLoading: boolean;
    loadingState: string;

    constructor(
        private stateService: StateService,
        private suggestionService: SuggestionService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private toast: ToastService,
        private meta: MetaService,
        private voteQuery: VotesQuery,
        private admin: AdminService,
        private suggestionQuery: SuggestionQuery
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.subscribeToSuggestionStore(ID)
            this.fetchData(ID)
        })

    }

    subscribeToSuggestionStore(id: string) {
        this.suggestionQuery.selectEntity(id)
            .subscribe((suggestion: Suggestion) => {
                if (!suggestion) return false
                this.suggestion = suggestion
                this.stateService.setLoadingState(AppState.complete)
            })
    }

    fetchData(id: string) {
        this.suggestionService.view({ id: id })
            .subscribe(
                (suggestion: Suggestion) => {
                    this.meta.updateTags(
                        {
                            title: `${suggestion.title}`,
                            appBarTitle: 'View Suggestion',
                            description: suggestion.description
                        })
                },
                () => this.stateService.setLoadingState(AppState.serverError)
            )
    }

    updateSuggestion(status: number) {
        this.isLoading = true

        const entity = assign({}, this.suggestion, { status })
        this.suggestionService.update({ id: this.suggestion._id, entity })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                () => this.toast.openSnackBar('Succesfully updated', 'OK'),
                (error) => this.toast.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            )
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
        const { item, voteValue } = voteData
        const vote = new Vote(item._id, 'Suggestion', voteValue)
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
                },
            )
    }

    convertSuggestion() {
        let suggestionType = this.suggestion.type || this.suggestion.parentType
        if (suggestionType === 'action') {
            suggestionType = 'proposal'
        }
        const url = `/${suggestionType}s/create`

        this.router.navigateByUrl(url, {
            state: {
                ...this.suggestion
            }
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

                    if (model === 'Suggestion') {
                        return this.suggestionService.updateSuggestionVote(entity._id, updatedEntity)
                    }
                },
                (err) => err
            )

    }

}
