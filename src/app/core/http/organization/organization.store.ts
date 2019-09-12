import { Injectable } from "@angular/core";
import { StoreConfig, Store, EntityState, EntityStore } from "@datorama/akita";
import { Organization } from "@app/core/models/organization.model";

export interface OrganizationState extends EntityState<Organization> { }

@Injectable()
@StoreConfig({ name: 'organization', idKey: '_id' })
export class OrganizationStore extends EntityStore<OrganizationState> {
    constructor() {
        super();
    }
}