import { Injectable } from "@angular/core";
import { QueryEntity, combineQueries } from "@datorama/akita";
import { SolutionState, SolutionStore } from "./solution.state";
import { Solution } from "@app/core/models/solution.model";
import { combineLatest } from "rxjs";
import { ProposalQuery } from "../proposal/proposal.query";
import { auditTime, map } from "rxjs/operators";
import { IssueQuery } from "../issue/issue.query";
import { VotesQuery } from "../vote/vote.query";

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
                        return {
                            ...solution,
                            proposals: solution.proposals.map((proposalId) => {
                                return proposals[proposalId]
                            }),
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
					return proposal._id === id;
				})

				return includesSolutionId;
            }
        })
    }
}