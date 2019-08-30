import { EntityState, StoreConfig, Store, EntityStore } from "@datorama/akita";
import { Injectable } from "@angular/core";

export interface VoteMetaData {
    up: number;
    down: number;
    _id: string;
}

export interface VoteMetaDataState extends EntityState<VoteMetaData> { };

@Injectable()
@StoreConfig({ name: 'votes' })
export class VoteStore extends EntityStore<VoteMetaDataState> {
    constructor() {
        super();
    }
}