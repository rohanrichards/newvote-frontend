import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { SuggestionState, SuggestionStore } from './suggestion.store'
import { Suggestion } from '@app/core/models/suggestion.model'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { combineLatest } from 'rxjs'
import { orderBy } from 'lodash'
import { map } from 'rxjs/operators'

@Injectable()
export class SuggestionQuery extends QueryEntity<SuggestionState, Suggestion> {
    selectFilter$ = this.select(state => state.filter);
    selectOrder$ = this.select(state => state.order);
    suggestions$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true
            }

            return !entity.softDeleted
        }
    })

    sortedProposals$ = combineLatest(this.selectFilter$, this.selectOrder$, this.suggestions$)
        .pipe(
            map(([filter, order, proposals]) => {
                return this.sortedProposals$(filter, order, proposals)
            })
        )

    constructor(
        protected store: SuggestionStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    sortSolutions(filter: string, order: string, suggestions: Suggestion[]) {
        const sortedOrder: any = order === 'ASCENDING' ? ['asc', 'desc'] : ['desc', 'asc']

        switch (filter) {
            case 'SHOW_ALL':
                return suggestions
            case 'VOTES':
                return orderBy(suggestions, ['votes.total'], sortedOrder)
            case 'TITLE':
                return orderBy(suggestions, ['title'], sortedOrder)
        }
    }

    getSuggestionWithSlug(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        return this.selectAll({
            filterBy: (entity: Suggestion) => isObjectId ? entity._id === id : entity.slug === id
        })
    }
}
