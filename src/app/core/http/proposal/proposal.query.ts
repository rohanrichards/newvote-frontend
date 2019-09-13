import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { Proposal } from "@app/core/models/proposal.model";
import { ProposalStore, ProposalState } from "./proposal.store";
import { SolutionQuery } from "../solution/solution.query";

@Injectable()
export class ProposalQuery extends QueryEntity<ProposalState, Proposal> {
    constructor(
        protected store: ProposalStore
        ) {
        super(store);
    }


    filterBySolutionId(id: string) {
        return this.selectAll({
            filterBy: (entity) => {
                const includesSolutionId = entity.solutions.some((solution: any) => {
					return solution._id === id;
				})

				return includesSolutionId;
            }
        })
    }
}