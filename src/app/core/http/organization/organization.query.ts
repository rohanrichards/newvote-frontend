import { Query, QueryEntity } from '@datorama/akita'
import { OrganizationStore, CommunityState, CommunityStore } from './organization.store'
import { Organization } from '@app/core/models/organization.model'
import { Injectable } from "@angular/core";

@Injectable()
export class CommunityQuery extends QueryEntity<CommunityState> {
    constructor(protected store: CommunityStore) {
        super(store)
    }
}

@Injectable()
export class OrganizationQuery extends Query<Organization> {
    constructor(protected store: OrganizationStore) {
        super(store)
    }


        
}
