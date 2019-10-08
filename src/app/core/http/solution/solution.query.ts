import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { SolutionState, SolutionStore } from './solution.state'
import { Solution } from '@app/core/models/solution.model'
import { ProposalQuery } from '../proposal/proposal.query'
import { map, filter } from 'rxjs/operators'
import { IssueQuery } from '../issue/issue.query'
import { VotesQuery } from '../vote/vote.query'
import { Proposal } from '@app/core/models/proposal.model'

import { cloneDeep, orderBy } from 'lodash'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { combineLatest } from 'rxjs'

@Injectable()
export class SolutionQuery extends QueryEntity<SolutionState, Solution> {
    selectFilter$ = this.select(state => state.filter);
    selectOrder$ = this.select(state => state.order);

    solutions$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true
            }

            return !entity.softDeleted
        }
    })

    // https://blog.angularindepth.com/plan-your-next-party-with-an-angular-invite-app-using-akita-422495351767
    sortedSolutions$ = combineLatest(this.selectFilter$, this.selectOrder$, this.solutions$)
        .pipe(
            map(([filter, order, solutions]) => {
                return this.sortSolutions(filter, order, solutions)
            })
        )

    constructor(
        protected store: SolutionStore,
        private proposalQuery: ProposalQuery,
        private issueQuery: IssueQuery,
        private voteQuery: VotesQuery,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    getSolutionWithSlug(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        return this.selectAll({
            filterBy: (entity: Solution) => isObjectId ? entity._id === id : entity.slug === id
        })
    }

    selectSolutions(issueId?: string) {
        return combineQueries(
            [
                this.sortedSolutions$,
                this.proposalQuery.proposals$,
            ]
        )
            .pipe(
                map((results) => {
                    let [solutions, proposals] = results

                    if (issueId) {
                        solutions = solutions.filter((solution) => {
                            return solution.issues.some((issue) => {
                                if (typeof issue === 'string') {
                                    return issue === issueId
                                }

                                return issue._id === issueId
                            })
                        })
                    }

                    return solutions.map((solution) => {

                        // Backwards map proposals.solutions to solutions.proposals array
                        // normally proposals would get attached on the backend
                        const solutionProposals = proposals.filter((proposal: Proposal) => {
                            return proposal.solutions.some((pSolution: any) => {
                                if (typeof pSolution === 'string') {
                                    return solution._id === pSolution
                                }

                                return solution._id === pSolution._id
                            })
                        })

                        return {
                            ...solution,
                            proposals: solutionProposals,
                            votes: solution.votes
                        }
                    })
                })
            )
    }

    filterByProposalId(id: string) {
        return this.solutions$
            .pipe(
                filter((entity: any) => {
                    const includesSolutionId = entity.proposals.some((proposal: any) => {
                        // New proposals return an array of string _id's instead of Objects with a property of
                        // ._id
                        if (typeof proposal === 'string') {
                            return proposal === id
                        }

                        return proposal._id === id
                    })

                    return includesSolutionId
                })
            )
    }

    sortSolutions(filter: string, order: string, solutions: Solution[]) {
        const sortedOrder: any = order === 'ASCENDING' ? ['asc', 'desc'] : ['desc', 'asc']

        switch (filter) {
            case 'SHOW_ALL':
                return solutions
            case 'VOTES':
                return orderBy(solutions, ['votes.total'], sortedOrder)
            case 'ACTIONS':
                return orderBy(solutions, ['proposals.length'], sortedOrder)
            case 'TITLE':
                return orderBy(solutions, ['title'], sortedOrder)
        }
    }
}
