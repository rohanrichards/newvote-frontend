import { Injectable } from "@angular/core";
import { QueryEntity, combineQueries } from "@datorama/akita";
import { SolutionState, SolutionStore } from "./solution.state";
import { Solution } from "@app/core/models/solution.model";
import { ProposalQuery } from "../proposal/proposal.query";
import { map } from "rxjs/operators";
import { IssueQuery } from "../issue/issue.query";
import { VotesQuery } from "../vote/vote.query";
import { Proposal } from "@app/core/models/proposal.model";

@Injectable()
export class SolutionQuery extends  QueryEntity<SolutionState, Solution> {
    constructor(
        protected store: SolutionStore,
        private proposalQuery: ProposalQuery,
        private issueQuery: IssueQuery,
        private voteQuery: VotesQuery
    ) {
        super(store);
    }

    selectSolutions() {
        return combineQueries(
            [
                this.selectAll(),
                this.proposalQuery.selectAll({ asObject: true }),
            ]
        )
            .pipe(
                map((results) => {
                    const [solutions, proposals] = results;

                    return solutions.map((solution) => {
                        let sProposals: Array<Proposal>;

                        if (solution.proposals.length < 1) {
                            sProposals = [];
                        } else {
                            sProposals = solution.proposals
                                .filter((proposalId) => {
                                    return proposals[proposalId];
                                })
                                .map((proposalId) => {
                                    return proposals[proposalId];
                                });
                        }

                        return {
                            ...solution,
                            proposals: sProposals,
                            votes: solution.votes
                        }
                    })
                })
            )
    }

    selectOneSolution(id: string) {
        return combineQueries(
            [
                this.selectEntity(id),
                this.proposalQuery.selectAll({ asObject: true }),
            ]
        )
            .pipe(
                map((results) => {
                    let [solution, proposals] = results;

                        return {
                            ...solution,
                            proposals: solution.proposals.map((proposalId) => {
                                return proposals[proposalId]
                            }),
                            votes: solution.votes
                        }
                    })
            )
    }

    filterByProposalId(id: string) {
        return this.selectAll({
            filterBy: (entity) => {
                const includesSolutionId = entity.proposals.some((proposal: any) => {
                    // New proposals return an array of string _id's instead of Objects with a property of
                    // ._id 
                    if (typeof proposal === "string") {
                        return proposal === id;
                    }

					return proposal._id === id;
				})

				return includesSolutionId;
            }
        })
    }
}