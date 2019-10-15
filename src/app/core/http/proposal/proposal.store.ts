import { Injectable } from '@angular/core'
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Proposal } from '@app/core/models/proposal.model'

export interface ProposalState extends EntityState<Proposal> { };

Injectable()
@StoreConfig({ name: 'proposals', idKey: '_id' })
export class ProposalStore extends EntityStore<ProposalState, Proposal> {
    constructor() {
        super()
    }
}
