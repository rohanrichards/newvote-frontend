import { Injectable } from "@angular/core";
import { IUser, User } from "../models/user.model";
import { AuthenticationStore } from "./authentication.store";
import { Query, toBoolean } from "@datorama/akita";
import { OrganizationQuery } from "../http/organization/organization.query";
import { Observable } from "rxjs";
import { Organization } from "../models/organization.model";


@Injectable({ providedIn: 'root' })
export class AuthenticationQuery extends Query<IUser> {
    isLoggedIn$ = this.select(state => !!state._id);
    isCommunityVerified$ = this.select(user => {
        return this.isUserPartOfOrganization(user)
    });

    constructor(
        protected store: AuthenticationStore,
        private organizationQuery: OrganizationQuery
    ) {
        super(store);
    }

    isLoggedIn() {
        return !!this.getValue()._id;
    }

    isOwner() {
        const user = this.getValue();
        const organization = this.organizationQuery.getValue();

        const organizationOwner = (organization.owner && organization.owner._id) && organization.owner._id === user._id
        return !!this.getValue().roles.includes('admin') || !!organizationOwner
    }

    isModerator() {
        const organization = this.organizationQuery.getValue();

        if (this.isOwner()) {
            return true;
        }

        if (!organization.moderators.length) {
            return false;
        }

        return organization.moderators.some((moderator: any) => {
            const userId = this.getValue()._id;
            if (typeof moderator === 'string') {
                return moderator === userId;
            }

            return moderator._id === userId;
        })
    }

    isUserPartOfOrganization(user: any): boolean {
        // if no user then the "user" is logged out, no need to do checks
        if (!user) return true;
        if (!user.verified) return false;
        if (!user.mobileNumber) return false;

        const org = this.organizationQuery.getValue();
        return user.organizations.some((id: string) => {
            return org._id === id
        })
    }

    isUserVerified() {
        return toBoolean(this.getValue().verified);
    }

    doesMobileNumberExist() {
        return toBoolean(this.getValue().mobileNumber);
    }

}