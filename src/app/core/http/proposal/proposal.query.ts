import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { Proposal, IProposal } from '@app/core/models/proposal.model'
import { ProposalStore, ProposalState } from './proposal.store'
import { SolutionQuery } from '../solution/solution.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { map } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { orderBy } from 'lodash'
import { ISolution } from '@app/core/models/solution.model'

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
                return this.sortProposals$(filter, order, proposals)
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

    // filterBySolutionId(id: string) {
    //     return this.sortedProposals$
    //         .pipe(
    //             map(
    //                 (entity) => {
    //                     return entity.filter((proposal: Proposal) => {
    //                         const includesSolutionId = proposal.solutions.some((solution: any) => {
    //                             // newly created proposals will return with a solutions array with just the object id
    //                             // instead of populated object
    //                             if (typeof solution === 'string') {
    //                                 return solution === id
    //                             }

    //                             return solution._id === id
    //                         })

    //                         return includesSolutionId
    //                     })
    //                 }
    //             )
    //         )
    // }

    // Filter softDeleted items for users below moderator
    checkModerator(entity: any) {
        if (this.auth.isModerator()) {
            return true
        }

        return !entity.softDeleted
    }

    getProposals(id?: string | boolean | any[], asObject?: boolean) {
        // if no id is present return all solutions
        if (!id) {

            if (asObject) {
                return this.selectAll({
                    filterBy: (entity: IProposal) => this.checkModerator(entity),
                    asObject: true
                })
            }
            return this.proposals$
        }

        return this.selectAll({
            filterBy: [
                (proposal: IProposal) => {
                    // Check each solution if it contains the issue id in it's
                    // issues array
                    // console.log(entity, 'this is entity')
                    return proposal.solutions.some((solution: ISolution | string) => {
                        if ((solution as ISolution)._id) {
                            return (solution as ISolution)._id === id
                        }
                        return solution === id
                    })
                },
                (entity: IProposal) => this.checkModerator(entity)
            ]
        })
    }

    sortProposals$(filter: string, order: string, proposals: Proposal[]) {
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
