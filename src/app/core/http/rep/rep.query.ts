import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { RepState, RepStore } from './rep.store'
import { Rep, IRep } from '@app/core/models/rep.model'
import { map, mapTo } from 'rxjs/operators'
import { ProposalQuery } from '../proposal/proposal.query'
import { SolutionQuery } from '../solution/solution.query'
import { IssueQuery } from '../issue/issue.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { OrganizationQuery } from '../organization/organization.query'
import { IOrganization } from '@app/core/models/organization.model'

@Injectable()
export class RepQuery extends QueryEntity<RepState, Rep> {
    Reps$ = this.selectAll()

    constructor(
        protected store: RepStore,
        private proposalQuery: ProposalQuery,
        private solutionQuery: SolutionQuery,
        private issueQuery: IssueQuery,
        public authQuery: AuthenticationQuery,
        private organizationQuery: OrganizationQuery
    ) {
        super(store)
    }

    getRepId() {
        return combineQueries([
            this.authQuery.select(),
            this.selectAll()
        ])
            .pipe(
                map(([user, reps]: any) => {
                    return reps.find((rep: any) => {
                        return rep.owner === user._id
                    })
                })
            )
    }

    repGuard(repId: string) {
        const rep = this.getEntity(repId);
        const { _id = false } = this.authQuery.getValue()

        if (!rep || !_id) return false
        if (this.authQuery.isModerator()) {
            return true
        }

        return rep.owner === _id
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
                if (!reps.length) return []
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

    // Check if user is rep for an organization
    isRep() {

        return combineQueries([
            this.selectAll(),
            this.organizationQuery.select(),
            this.authQuery.select()
        ])
            .pipe(
                map(([reps, organization, user]: any) => {
                    const { _id, roles } = user

                    // do they have the rep role
                    const isRep = roles.includes('rep')
                    if (!isRep) return false
                    const isRepForOrg = reps.find((rep: any) => {
                        return rep.owner === _id
                    })
                    if (!isRepForOrg) return false
                    return true
                })
            )

        // return userRep && hasRepRole
    }

    // For guard for create entity pages
    // need to check if a user is
    // 1) loggedin
    // 2) verified
    // 3) has been assigned a rep role
    // 4) they are a rep and they are a rep for the current organization
    // being browsed
    isRepForOrg() {
        const ROLE = 'rep'
        const { _id, roles } = this.authQuery.getValue()

        if (this.authQuery.isModerator()) {
            return true
        }

        if (!_id) {
            return false
        }
        if (!this.authQuery.isUserVerified()) {
            return false
        }
        const hasRepRole = roles.includes(ROLE)
        const organizationId = this.organizationQuery.getValue()._id

        const rep = this.getAll({
            filterBy: (entity: any) => {
                const { owner, organizations } = entity
                return owner === _id && organizations === organizationId
            }
        })

        return rep.length && hasRepRole
    }

    // compare a repId against the current user to determine
    // whether they should have access

    canAccessRepProfile(repId: any) {
        const organization = this.organizationQuery.getValue()
        const { _id } = this.authQuery.getValue()
        const { owner, organizations } = this.getEntity(repId)

        if (this.authQuery.isModerator()) {
            return true
        }

        if (organization._id !== organizations) {
            return false
        }

        return owner === _id
    }

    isUserRep(id: string, organization: IOrganization) {
        return this.getAll({
            filterBy: (rep: IRep) => {
                return rep.owner === id && rep.organizations === organization._id
            }
        }).length
    }
}
