import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { SolutionState, SolutionStore } from './solution.store'
import { Solution, ISolution } from '@app/core/models/solution.model'
import { ProposalQuery } from '../proposal/proposal.query'
import { map, filter } from 'rxjs/operators'
import { IssueQuery } from '../issue/issue.query'
import { VotesQuery } from '../vote/vote.query'
import { Proposal } from '@app/core/models/proposal.model'

import { orderBy } from 'lodash'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { combineLatest } from 'rxjs'
import { IIssue } from '@app/core/models/issue.model'

@Injectable()
export class SolutionQuery extends QueryEntity<SolutionState, Solution> {
    selectFilter$ = this.select(state => state.filter);
    selectOrder$ = this.select(state => state.order);

    solutions$ = this.selectAll({
        filterBy: (entity) => this.checkModerator(entity)
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

    getSolutions(id?: string | boolean | any[]) {
        // if no id is present return all solutions
        if (!id) {
            return this.solutions$
        }

        return this.selectAll({
            filterBy: [
                (solution: ISolution) => {
                    // Check each solution if it contains the issue id in it's
                    // issues array
                    // console.log(entity, 'this is entity')
                    return solution.issues.some((issue: IIssue | string) => {
                        if ((issue as IIssue)._id) {
                            return (issue as IIssue)._id === id
                        }
                        return issue === id
                    })
                },
                (entity: ISolution) => this.checkModerator(entity)
            ]
        })
    }

    // Filter softDeleted items for users below moderator
    checkModerator(entity: any) {
        if (this.auth.isModerator()) {
            return true
        }

        return !entity.softDeleted
    }

    private sortSolutions(filter: string, order: string, solutions: Solution[]) {
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
