import { Query, QueryEntity } from "@datorama/akita";
import { OrganizationStore, OrganizationState } from "./organization.store";
import { Organization } from "@app/core/models/organization.model";

export class OrganizationQuery extends QueryEntity<OrganizationState> {
    constructor(protected store: OrganizationStore) {
        super(store);
    }
}