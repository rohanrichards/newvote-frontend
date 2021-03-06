import { Injectable } from '@angular/core'
import { IUser } from '../models/user.model'
import { AuthenticationStore } from './authentication.store'
import { Query, toBoolean, combineQueries } from '@datorama/akita'
import { OrganizationQuery } from '../http/organization/organization.query'
import { map } from 'rxjs/operators'
import { Organization, IOrganization } from '../models/organization.model'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class AuthenticationQuery extends Query<IUser> {
    isLoggedIn$ = this.select(state => !!state._id)
    isCommunityVerified$: Observable<any> = combineQueries([
        this.select(),
        this.organizationQuery.select(),
    ]).pipe(
        map(([user, organization]) => {
            return this.isUserPartOfOrganization(user, organization)
        }),
    )

    constructor(
        protected store: AuthenticationStore,
        private organizationQuery: OrganizationQuery,
    ) {
        super(store)
    }

    isLoggedIn() {
        return !!this.getValue()._id
    }

    hasRole(role: string) {
        return !!this.getValue().roles.includes(role)
    }

    isCommunityVerified(organization: any) {
        const user = this.getValue()
        return this.isUserPartOfOrganization(user, organization)
    }

    isAdmin() {
        const user = this.getValue()
        return !!this.getValue().roles.includes('admin')
    }

    isOwner() {
        const user = this.getValue()
        const organization = this.organizationQuery.getValue()

        const organizationOwner =
            organization.owner &&
            organization.owner._id &&
            organization.owner._id === user._id
        return !!this.getValue().roles.includes('admin') || !!organizationOwner
    }

    isModerator() {
        const organization = this.organizationQuery.getValue()

        if (this.isOwner()) {
            return true
        }

        if (!organization.moderators.length) {
            return false
        }

        return organization.moderators.some((moderator: any) => {
            const userId = this.getValue()._id
            if (typeof moderator === 'string') {
                return moderator === userId
            }

            return moderator._id === userId
        })
    }

    // rewriting query to not import other queries
    isModeratorNew(organization: IOrganization) {
        if (this.isOwner()) {
            return true
        }

        if (!organization.moderators.length) {
            return false
        }

        return organization.moderators.some((moderator: any) => {
            const userId = this.getValue()._id
            if (typeof moderator === 'string') {
                return moderator === userId
            }

            return moderator._id === userId
        })
    }

    isUserPartOfOrganization(user: IUser, organization: IOrganization) {
        const { authType } = organization
        return authType === 0
            ? this.isLocalVerified(user, organization)
            : this.isSSOVerified(user, organization)
    }

    isUserVerified() {
        const user = this.getValue();
        const organization = this.organizationQuery.getValue()

        return this.isUserPartOfOrganization(user, organization)
        // return toBoolean(this.getValue().verified)
    }

    canVerify() {
        const {
            verified = false,
            roles = [],
            mobileNumber = '',
            providerData = {},
        } = this.getValue()
        const { authType, url } = this.organizationQuery.getValue()
        if (!verified) return false
        if (roles.includes('guest')) return false
        if (!mobileNumber) return false

        if (authType === 1) {
            return providerData && providerData[url]
        }
        return true
    }

    isLocalVerified(user: IUser, organization: IOrganization) {
        if (!user.verified) return false
        if (user.roles.includes('guest')) return false
        if (!user.mobileNumber) return false
        if (!user.organizations.length) return false
        return user.organizations.some((userOrganization: any) => {
            if (typeof userOrganization === 'string') {
                return organization._id === userOrganization
            }
            return organization._id === userOrganization._id
        })
    }

    isSSOVerified(user: IUser, organization: IOrganization) {
        const { providerData } = user
        const { url } = organization

        return providerData && providerData[url]
    }

    isCreator(object?: any): boolean {
        const user = this.getValue()
        if (!user || !user._id || !object.user || !object.user._id) return false

        const id = object.user._id || object.user
        if (id === user._id) return true

        return false
    }

    tourComplete(): boolean {
        const user = this.getValue()
        return user.completedTour
    }
}
