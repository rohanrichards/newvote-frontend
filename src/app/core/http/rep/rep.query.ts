import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { RepState, RepStore } from './rep.store'

import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { Rep, IRep } from '@app/core/models/rep.model'
import { map, mapTo } from 'rxjs/operators'
import { OrganizationQuery } from '../organization/organization.query'
import { ProposalQuery } from '../proposal/proposal.query'
import { SolutionQuery } from '../solution/solution.query'
import { IssueQuery } from '../issue/issue.query'
import { combineLatest, forkJoin, of } from 'rxjs'
import { handleError } from '../errors'

@Injectable()
export class RepQuery extends QueryEntity<RepState, Rep> {
    Reps$ = this.selectAll()
    repId$ = combineQueries(
        [
            this.auth.select(),
            this.selectAll(),
        ]
    ).pipe((
        map((res: any) => {
            const [user, reps] = res

            return reps.find((rep: any) => {
                if (rep.owner === user._id) {
                    return rep._id
                }
                return false
            })
        })
    ))

    constructor(
        protected store: RepStore,
        private auth: AuthenticationQuery,
        private orgQuery: OrganizationQuery,
        private proposalQuery: ProposalQuery,
        private solutionQuery: SolutionQuery,
        private issueQuery: IssueQuery
    ) {
        super(store)
    }

    isRep() {
        return combineQueries(
            [
                this.auth.select(),
                this.selectAll(),
                this.orgQuery.select()
            ]
        )
            .pipe(
                map((results) => {
                    const [user, reps, org] = results
                    if (!user) {
                        return false
                    }

                    // find if user exists as a rep
                    const hasRepRole = user.roles.includes('rep')

                    // find the rep within the reps
                    const userRep = reps.find((doc) => {
                        return doc.owner === user._id
                    })

                    if (!userRep) return false

                    // a user might be a rep for multiple orgs, check the rep obejct
                    // has the correct org._id
                    const isRepForOrg = org._id === userRep.organizations

                    return hasRepRole && isRepForOrg
                })
            )
    }

    populateReps() {
        return combineQueries(
            [
                this.selectAll(),
                this.proposalQuery.proposals$,
                this.solutionQuery.solutions$,
                this.issueQuery.issues$
            ]
        ).pipe(
            map(([reps, allProposals, allSolutions, allIssues]: any) => {
                const newReps = reps.slice().map((rep: any) => {
                    let { proposals, solutions, issues } = rep

                    if (proposals.length) {
                        proposals = this.filterAndMapEntity(proposals, allProposals)
                    }
                    if (solutions.length) {
                        solutions = this.filterAndMapEntity(solutions, allSolutions)
                    }

                    if (issues.length) {
                        issues = this.filterAndMapEntity(issues, allIssues)
                    }
                    
                    // not returning an object causes query to fail...
                    return {
                        ...rep,
                        proposals,
                        solutions,
                        issues
                    }
                })

                return newReps
            }),
        )
    }

    // entities on reps are not filtered on backend so need to make sure soft Deleted items
    // are filtered out
    // 1) combine potential array of strings (objectIds) || objects (with object._id) against entire collection of entities
    // 2) once array is filtered, map over the array so that we always return an object (not string) from the main entity collection
    filterAndMapEntity (objectEntities: any, allEntities: any) {
        let newCollection = objectEntities.slice().filter((entity: any) => {
            return allEntities.some((item: any) => {
                if (typeof entity === 'string') {
                    return item._id === entity
                }

                return item._id === entity._id
            })
        })
        if (!newCollection.length) return false
        newCollection = newCollection.slice()
            .map((entity: any) => {
                if (typeof entity === 'string') {
                    return allEntities.find((item: any) => {
                        return item._id === entity
                    })
                }

                return entity
            })
        return newCollection
    }
}
