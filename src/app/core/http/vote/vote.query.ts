import { QueryEntity } from "@datorama/akita";
import { VoteMetaDataState, VoteStore, VoteMetaData } from "./vote.store";
import { Observable } from "rxjs";
import { Vote } from "@app/core/models/vote.model";
import { Injectable } from "@angular/core";

@Injectable()
export class VotesQuery extends QueryEntity<VoteMetaDataState, VoteMetaData> {
    constructor(protected store: VoteStore) {
        super(store);
    }
}