import { Injectable } from "@angular/core";
import { IUser } from "../models/user.model";
import { AuthenticationStore } from "./authentication.store";
import { Query } from "@datorama/akita";
import { OrganizationQuery } from "../http/organization/organization.query";


@Injectable({ providedIn: 'root' })
export class AuthenticationQuery extends Query<IUser> {
    isLoggedIn$ = this.select(state => !!state._id);

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

}