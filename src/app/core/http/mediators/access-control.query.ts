import { Injectable } from '@angular/core';
import { RepQuery } from '../rep/rep.query';
import { OrganizationQuery } from '../organization/organization.query';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { combineQueries, toBoolean } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

const RoleList = {
    guest: 'guest',
    user: 'user',
    rep: 'rep',
    admin: 'admin'
}
@Injectable()

export class AccessControlQuery {
    isCommunityVerified$: Observable<any> = combineQueries([
        this.auth.select(),
        this.org.select(),
    ])
        .pipe(
            map(([user, organization]: any) => {
                return this.auth.isUserPartOfOrganization(user, organization)
            })
        )

    constructor(private rep: RepQuery, private auth: AuthenticationQuery, private org: OrganizationQuery) { }
    // Verification Checks
    // 1) Have they verified their account? Mobile / email verification + have removed guest role & gained 'user' role
    // 2) Are they community verified - been granted accesss & organizationId is on the users organizations object

    isCommunityVerified() {
        const user = this.auth.getValue()
        const organization = this.org.getValue()
        return this.auth.isUserPartOfOrganization(user, organization)
    }

    // Check for buttons
    canAccess(role: string) {
        const userHasRole = this.auth.hasRole(role)
        const { _id: userId } = this.auth.getValue()
        const organization = this.org.getValue()

        // admins have access to all
        if (this.auth.isAdmin()) return true
        // moderators can access rep data without being a rep
        if (this.auth.isModeratorNew(organization) && role === 'rep') return true
        // user does not have specified role
        if (!userHasRole) return false
        // the user has the role but is not verified so should not have access to anything
        if (!this.auth.isCommunityVerified(organization)) return false
        // Check user is rep for the community
        if (role === 'rep' && !this.rep.isUserRep(userId, organization)) return false
        // this point a user has the role & is verified with the community
        return true
    }
}
