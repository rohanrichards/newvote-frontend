import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Injectable } from '@angular/core'

export interface VoteMetaData {
    _id: string;
    up: number;
    down: number;
    total: number;
}

export interface VoteMetaDataState extends EntityState<VoteMetaData> { };

@Injectable()
@StoreConfig({ name: 'votes', idKey: '_id' })
export class VoteStore extends EntityStore<VoteMetaDataState> {
    constructor() {
        super()
    }
}
