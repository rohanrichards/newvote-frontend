import { Injectable } from '@angular/core'
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Proposal } from '@app/core/models/proposal.model'

export interface ProposalState extends EntityState<Proposal> { };

const initialState = {
    filter: 'SHOW_ALL',
    sort: 'ASCENDING'
}

Injectable()
@StoreConfig({ 
    name: 'proposals',
    idKey: '_id',
    cache: {
        ttl: 3600000
    }
})
export class ProposalStore extends EntityStore<ProposalState, Proposal> {
    constructor() {
        super(initialState)
    }
}
