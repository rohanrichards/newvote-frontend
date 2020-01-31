import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { RepState, RepStore } from './rep.store'

import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { Rep } from '@app/core/models/rep.model'
import { map } from 'rxjs/operators'
import { OrganizationQuery } from '../organization/organization.query'

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
        private orgQuery: OrganizationQuery
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
}