import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { Proposal } from '@app/core/models/proposal.model'
import { ProposalStore, ProposalState } from './proposal.store'
import { SolutionQuery } from '../solution/solution.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { map } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { orderBy } from 'lodash'

@Injectable()
export class ProposalQuery extends QueryEntity<ProposalState, Proposal> {
    selectFilter$ = this.select(state => state.filter);
    selectOrder$ = this.select(state => state.order);

    proposals$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true
            }

            return !entity.softDeleted
        }
    })

    sortedProposals$ = combineLatest(this.selectFilter$, this.selectOrder$, this.proposals$)
        .pipe(
            map(([filter, order, proposals]) => {
                return this.sortedProposals$(filter, order, proposals)
            })
        )

    constructor(
        protected store: ProposalStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    getProposalWithSlug(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        return this.selectAll({
            filterBy: (entity: Proposal) => isObjectId ? entity._id === id : entity.slug === id
        })
    }

    filterBySolutionId(id: string) {
        return this.proposals$
            .pipe(
                map((proposals: any) => {
                    return proposals.filter((item: any) => {
                        return item.solutions.some((solution: any) => {
                            if (typeof solution === 'string') {
                                return solution === id
                            }

                            return solution._id === id
                        })
                    }
                    )
                })
            )
    }

    sortSolutions(filter: string, order: string, proposals: Proposal[]) {
        const sortedOrder: any = order === 'ASCENDING' ? ['asc', 'desc'] : ['desc', 'asc']

        switch (filter) {
            case 'SHOW_ALL':
                return proposals
            case 'VOTES':
                return orderBy(proposals, ['votes.total'], sortedOrder)
            case 'TITLE':
                return orderBy(proposals, ['title'], sortedOrder)
        }
    }
}
