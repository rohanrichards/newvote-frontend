import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { Proposal } from "@app/core/models/proposal.model";
import { ProposalStore, ProposalState } from "./proposal.store";

@Injectable()
export class ProposalQuery extends QueryEntity<ProposalState, Proposal> {
    constructor(protected store: ProposalStore) {
        super(store);
    }
}