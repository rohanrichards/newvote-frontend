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
        return !!this.getValue().roles.includes('admin') || this.organizationQuery.getValue().owner._id === this.getValue()._id
    }

}