import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { Proposal } from "@app/core/models/proposal.model";
import { ProposalStore, ProposalState } from "./proposal.store";
import { SolutionQuery } from "../solution/solution.query";
import { AuthenticationQuery } from "@app/core/authentication/authentication.query";
import { map, filter } from "rxjs/operators";
import { Solution } from "@app/core/models/solution.model";

@Injectable()
export class ProposalQuery extends QueryEntity<ProposalState, Proposal> {
    proposals$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
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
        return this.proposals$
            .pipe(
                map((proposals: any) => {
                    return proposals.filter((item: any) => {
                        return item.solutions.some((solution: any) => {
                            if (typeof solution === 'string') {
                                return solution === id;
                            }
                            return solution._id === id;
                        })
                    })
                })
            )
    }
}