import { Component, OnInit } from '@angular/core'
import { finalize, take, map } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Vote } from '@app/core/models/vote.model'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'

import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { ActivatedRoute } from '@angular/router'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { ToastService } from '@app/core/toast/toast.service'

@Component({
    selector: 'app-proposal',
    templateUrl: './proposal-list.component.html',
    styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit {

    suggestions: Array<any> = [];
    proposals: Array<any> = [];
    isLoading: boolean;
    loadingState: string;
    headerTitle = 'Browse By Action';
    headerText = 'Actions arrange the current actions into broader categories. \
        Select a action below to learn more about it and explore relevant actions being discussed.';

    headerButtons = [{
        text: 'New Action',
        color: 'warn',
        routerLink: '/proposals/create',
        role: 'admin'
    },
    {
        text: 'Make Suggestion',
        color: 'warn',
        routerLink: '/suggestions/create',
        role: 'user',
        params: { type: 'action' }
    }];

    constructor(
        private stateService: StateService,
        private proposalService: ProposalService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        private suggestionService: SuggestionService,
        public toast: ToastService,
        private meta: MetaService,
        private proposalQuery: ProposalQuery,
        private suggestionQuery: SuggestionQuery,
        private voteQuery: VotesQuery,
        public admin: AdminService,
        private route: ActivatedRoute,
        private entityVotes: EntityVotesQuery
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.meta.updateTags(
            {
                title: 'All Actions',
                description: 'List all actions.'
            })

        this.fetchData()
        this.subscribeToProposalStore()
        this.subscribeToSuggestionStore()

    }

    subscribeToProposalStore() {
        this.proposalQuery.selectAll({})
            .subscribe((proposals) => {
                if (!proposals) return false
                this.proposals = proposals
            })
    }

    subscribeToSuggestionStore() {
        this.entityVotes.getManySuggestions('action', 'type')
            .subscribe((suggestions) => {
                if (!suggestions) return false
                this.suggestions = suggestions
            })
    }

    fetchData() {
        const isModerator = this.auth.isModerator()
        this.isLoading = true
        const params = { softDeleted: isModerator ? true : '' }

        this.proposalService.list({ orgs: [], params })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                () => this.stateService.setLoadingState(AppState.complete),
                () => this.stateService.setLoadingState(AppState.error)
            )

        this.suggestionService.list({
            forceUpdate: true,
            params: {
                showDeleted: isModerator ? true : '',
                type: 'solution',
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )

    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
        const { item, voteValue, item: { votes: { currentUser = false } = false } } = voteData
        const vote = new Vote(item._id, model, voteValue)
        if (currentUser) {
            vote.voteValue = currentUser.voteValue === voteValue ? 0 : voteValue
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => {
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

}
