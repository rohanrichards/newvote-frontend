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
                    // newly created proposals will return with a solutions array with just the object id
                    // instead of populated object
                    if (typeof solution === 'string') {
                        return solution === id;
                    }

					return solution._id === id;
				})

				return includesSolutionId;
            }
        })
    }
}