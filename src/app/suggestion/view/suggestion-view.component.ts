import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { Vote } from '@app/core/models/vote.model'
import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'

import { assign } from 'lodash'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion-view.component.html',
    styleUrls: ['./suggestion-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class SuggestionViewComponent implements OnInit {

    suggestion: ISuggestion;
    suggestions: Array<ISuggestion>;
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
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private voteQuery: VotesQuery,
        private admin: AdminService,
        private suggestionQuery: SuggestionQuery,
        private entityVotes: EntityVotesQuery,
        public authQuery: AuthenticationQuery
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
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        const key = isObjectId ? '_id' : 'slug'
        this.entityVotes.getManySuggestions(id, key)
            .subscribe((suggestion: ISuggestion[]) => {
                if (!suggestion.length) return false
                const [entity, ...rest] = suggestion
                this.suggestion = entity
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
                () => this.stateService.setLoadingState(AppState.error)
            )
    }

    updateSuggestion(data: any) {
        const { suggestion, status } = data
        this.isLoading = true

        const entity = assign({}, this.suggestion, { status })
        this.suggestionService.update({ id: this.suggestion._id, entity })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                () => this.admin.openSnackBar('Succesfully updated', 'OK'),
                (error) => this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
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
                    this.admin.openSnackBar('Your vote was recorded', 'OK')
                },
                (error) => {
                    if (error.status === 401) {
                        this.admin.openSnackBar('You must be logged in to vote', 'OK')
                    } else {
                        this.admin.openSnackBar('There was an error recording your vote', 'OK')
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

}
