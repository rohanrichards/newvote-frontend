import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { RepState, RepStore } from './rep.store'

import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { Rep } from '@app/core/models/rep.model'
import { map } from 'rxjs/operators'
import { OrganizationQuery } from '../organization/organization.query'
import { ProposalQuery } from '../proposal/proposal.query'
import { SolutionQuery } from '../solution/solution.query'
import { IssueQuery } from '../issue/issue.query'

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
                this.proposalQuery.selectAll(),
                this.solutionQuery.selectAll(),
                this.issueQuery.selectAll()
            ]
        )
            .pipe(
                map((result: any) => {
                    const [reps, proposals, solutions, issues] = result
                    
                    console.log(reps, 'this is before reps')
                    if (!reps.length) return false
                    reps.map((rep: any) => {
                        console.log('LOOPING')
                        if (rep.proposals.length && proposals.length) {
                            rep.proposals = rep.proposals.map((proposalId: any) => {
                                return proposals.find((item: any) => {
                                    return item._id === proposalId
                                })
                            })
                        }

                        if (rep.solutions.length && solutions.length) {
                            rep.solutions = rep.solutions.map((solutionId: any) => {
                                return solutions.find((item: any) => {
                                    return item._id === solutionId
                                })
                            })
                        }

                        if (rep.issues.length && issues.length) {
                            rep.issues = rep.issues.map((issueId: any) => {
                                return issues.find((item: any) => {
                                    return item._id === issueId
                                })
                            })
                        }

                        return rep
                    })
                    console.log(reps, 'this is after reps')
                    return reps
                })
            )
    }
}
