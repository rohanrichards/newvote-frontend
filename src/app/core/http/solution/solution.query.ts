import { Injectable } from "@angular/core";
import { QueryEntity, combineQueries } from "@datorama/akita";
import { SolutionState, SolutionStore } from "./solution.state";
import { Solution } from "@app/core/models/solution.model";
import { ProposalQuery } from "../proposal/proposal.query";
import { map } from "rxjs/operators";
import { IssueQuery } from "../issue/issue.query";
import { VotesQuery } from "../vote/vote.query";
import { Proposal } from "@app/core/models/proposal.model";

import { cloneDeep } from 'lodash';

@Injectable()
export class SolutionQuery extends QueryEntity<SolutionState, Solution> {
    constructor(
        protected store: SolutionStore,
        private proposalQuery: ProposalQuery,
        private issueQuery: IssueQuery,
        private voteQuery: VotesQuery
    ) {
        super(store);
    }

    selectSolutions(issueId?: string) {
        return combineQueries(
            [
                this.selectAll(),
                this.proposalQuery.selectAll(),
            ]
        )
            .pipe(
                map((results) => {
                    let [solutions, proposals] = results;

                    if (issueId) {
                        solutions = solutions.filter((solution) => {
                            return solution.issues.some((issue) => {
                                if (typeof issue === 'string') {
                                    return issue === issueId;
                                }

                                return issue._id === issueId;
                            })
                        })
                    }

                    return solutions.map((solution) => {

                        // Backwards map proposals.solutions to solutions.proposals array
                        // normally proposals would get attached on the backend
                        const solutionProposals = proposals.filter((proposal: Proposal) => {
                            return proposal.solutions.some((pSolution: any) => {
                                if (typeof pSolution === 'string') {
                                    return solution._id === pSolution;
                                }

                                return solution._id === pSolution._id;
                            })
                        })

                        return {
                            ...solution,
                            proposals: solutionProposals,
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
                this.proposalQuery.selectAll(),
            ]
        )
            .pipe(
                map((results) => {
                    let [solution, proposals] = results;

                    const solutionProposals = proposals.filter((proposal: Proposal) => {
                        return proposal.solutions.some((pSolution: any) => {
                            if (typeof pSolution === 'string') {
                                return solution._id === pSolution;
                            }

                            return solution._id === pSolution._id;
                        })
                    })

                    return {
                        ...solution,
                        proposals: solutionProposals,
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