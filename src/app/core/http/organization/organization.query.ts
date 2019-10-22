import { Query, QueryEntity } from '@datorama/akita'
import { OrganizationStore, CommunityState, CommunityStore } from './organization.store'
import { Organization } from '@app/core/models/organization.model'

export class CommunityQuery extends QueryEntity<CommunityState> {
    constructor(protected store: CommunityStore) {
        super(store)
    }
}

export class OrganizationQuery extends Query<Organization> {
    constructor(protected store: OrganizationStore) {
        super(store)
    }
}
