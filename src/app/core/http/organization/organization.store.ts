import { Injectable } from '@angular/core'
import { StoreConfig, Store, EntityState, EntityStore } from '@datorama/akita'
import { Organization } from '@app/core/models/organization.model'

export function createInitialStore(): Organization {
    return {
        _id: '',
        authEntityId: '',
        authType: 0,
        authUrl: '',
        description: '',
        futureOwner: {},
        iconUrl: '',
        imageUrl: '',
        longDescription: '',
        moderators: [],
        name: '',
        newLeaderEmail: '',
        organizationName: '',
        organizationUrl: '',
        owner: {},
        privateOrg: false,
        softDeleted: false,
        url: '',
        voteRoles: [],
        representativeTitle: '',
    }
}

@Injectable()
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends Store<Organization> {
    constructor() {
        super(createInitialStore())
    }
}

export interface CommunityState extends EntityState<Organization> { }

@Injectable()
@StoreConfig({ name: 'communities', idKey: '_id' })
export class CommunityStore extends EntityStore<CommunityState> {
    constructor() {
        super()
    }
}
