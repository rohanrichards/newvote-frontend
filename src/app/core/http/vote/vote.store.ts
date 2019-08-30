import { EntityState, StoreConfig, Store, EntityStore } from "@datorama/akita";

export interface VoteMetaData {
    up: number;
    down: number;
    _id: string;
}

export interface VoteMetaDataState extends EntityState<VoteMetaData> { };

@StoreConfig({ name: 'votes' })
export class VoteStore extends EntityStore<VoteMetaDataState> {
    constructor() {
        super();
    }
}