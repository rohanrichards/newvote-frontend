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
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private proposalQuery: ProposalQuery,
        private suggestionQuery: SuggestionQuery,
        private voteQuery: VotesQuery,
        public admin: AdminService,
        private route: ActivatedRoute
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
        this.suggestionQuery.suggestions$
            .pipe(
                map((suggestions) => {
                    return suggestions.filter((suggestion) => suggestion.type === 'action')
                }),
            )
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
        const { item, voteValue } = voteData
        const vote = new Vote(item._id, 'Proposal', voteValue)
        const existingVote = item.votes.currentUser

        if (existingVote) {
            vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => { this.isLoading = false }))
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
