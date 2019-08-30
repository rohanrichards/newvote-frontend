import { QueryEntity } from "@datorama/akita";
import { VoteMetaDataState, VoteStore, VoteMetaData } from "./vote.store";

export class VotesQuery extends QueryEntity<VoteMetaDataState, VoteMetaData> {
    constructor(protected store: VoteStore) {
        super(store);
    }
}