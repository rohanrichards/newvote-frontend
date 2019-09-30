import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { Proposal } from "@app/core/models/proposal.model";
import { ProposalStore, ProposalState } from "./proposal.store";
import { SolutionQuery } from "../solution/solution.query";
import { AuthenticationQuery } from "@app/core/authentication/authentication.query";

@Injectable()
export class ProposalQuery extends QueryEntity<ProposalState, Proposal> {
    proposals$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isOwner()) {
                return true;
            }

            return !entity.softDeleted;
        }
    })

    constructor(
        protected store: ProposalStore,
        private auth: AuthenticationQuery
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