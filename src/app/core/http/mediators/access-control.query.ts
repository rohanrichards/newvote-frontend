import { Injectable } from '@angular/core';
import { RepQuery } from '../rep/rep.query';
import { OrganizationQuery } from '../organization/organization.query';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

const RoleList = {
    guest: 'guest',
    user: 'user',
    rep: 'rep',
    admin: 'admin'
}
@Injectable()

export class AccessControlQuery {
    constructor(private rep: RepQuery, private auth: AuthenticationQuery, private org: OrganizationQuery) { }

    canAccess(role: string) {
        const userHasRole = this.auth.hasRole(role)
        const { _id: userId } = this.auth.getValue()
        const organization = this.org.getValue()

        // admins have access to all
        if (this.auth.isAdmin()) return true
        // moderators have access to rep
        if (this.auth.isModeratorNew(organization) && role === 'rep') return true
        // user does not have specified roles
        if (!userHasRole) return false
        // the user is not verified so should not have access to anything
        if (!this.auth.isCommunityVerified(organization)) return false
        // Check user is rep for the community
        if (role === 'rep' && !this.rep.isUserRep(userId, organization)) return false
        // at this point a user has the role & is verified with the community
        return true
    }
}
