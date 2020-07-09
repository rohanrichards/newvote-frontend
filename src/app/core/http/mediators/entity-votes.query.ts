import { Injectable } from "@angular/core";
import { VotesQuery } from "../vote/vote.query";
import { SolutionQuery } from "../solution/solution.query";
import { ProposalQuery } from "../proposal/proposal.query";
import { SuggestionQuery } from "../suggestion/suggestion.query";
import { combineQueries, HashMap } from "@datorama/akita";
import { map, mergeMap, filter } from "rxjs/operators";
import { ISolution } from "@app/core/models/solution.model";
import { IProposal, Proposal } from "@app/core/models/proposal.model";
import { ISuggestion } from "@app/core/models/suggestion.model";
import { IVote } from "@app/core/models/vote.model";

@Injectable()
export class EntityVotesQuery {

    constructor(
        public votes: VotesQuery,
        public solutions: SolutionQuery,
        public proposals: ProposalQuery,
        public suggestions: SuggestionQuery) { }

    getSolution(id: string) {
        // Send request to query to get the solution
        return this.solutions.getSolution(id)
            .pipe(
                // query uses selectAll so returns either an empty array or
                // an array with the single value
                map((solutions: ISolution[]) => {
                    const [solution] = solutions
                    return solution
                }),
                mergeMap((solution: ISolution) => {
                    // The original id could be a slug so we wait to get a single solution
                    // before querying for vote data
                    return this.votes.getVote(solution._id || false)
                        .pipe(
                            map((votes: any) => {
                                const [vote] = votes
                                // return a single solution & populate it with corresponding vote data
                                return Object.assign({}, solution, {
                                    votes: vote
                                })
                            })
                        )
                })
            )
    }

    getManySolutions(issueId?: string) {
        return combineQueries([
            this.solutions.getSolutions(issueId),
            this.votes.selectAll({ asObject: true }),
            this.proposals.getProposalsMap()
        ])
            .pipe(
                map(([solutions, votes, proposals]) => {
                    // Map votes to proposals first, then add proposals to solutions
                    return solutions.slice().map((solution: ISolution) => {
                        let { proposals: sProposals } = solution

                        // proposals exist so repopulate the array with query proprosals
                        if (solution.proposals.length) {
                            sProposals = this.populateCollection(sProposals, proposals, votes)
                        }

                        return Object.assign({}, solution, {
                            votes: votes[solution._id],
                            proposals: sProposals
                        })
                    })
                }),
                mergeMap((solutions: ISolution[]) => {
                    return combineQueries([
                        this.solutions.selectFilter$,
                        this.solutions.selectOrder$
                    ]).pipe(
                        map(([filter, order]) => {
                            return this.solutions.sortSolutions(filter, order, solutions)
                        })
                    )
                })
            )
    }

    getProposal(id: string) {
        return this.proposals.getProposal(id)
            .pipe(
                map((proposals: IProposal[]) => {
                    const [proposal] = proposals
                    return proposal
                }),
                mergeMap((proposal: IProposal) => {
                    return this.votes.getVote(proposal._id)
                        .pipe(
                            map((votes: any) => {
                                const [vote] = votes
                                return Object.assign({}, proposal, {
                                    votes: vote
                                })
                            })
                        )
                })
            )
    }

    getManyProposals(solutionId?: string) {
        return combineQueries([
            this.proposals.getProposals(solutionId),
            this.votes.selectAll({ asObject: true }),
        ])
            .pipe(
                map(([proposals, votes]) => {
                    return proposals.slice().map((proposal: any) => {
                        return Object.assign({}, proposal, {
                            votes: votes[proposal._id]
                        })
                    })
                }),
                mergeMap((proposals: IProposal[]) => {
                    return combineQueries([
                        this.proposals.selectFilter$,
                        this.proposals.selectOrder$
                    ]).pipe(
                        map(([filter, order]) => {
                            return this.proposals.sortProposals(filter, order, proposals)
                        })
                    )
                })
            )
    }

    getSuggestion(id: string) {
        return this.suggestions.getSuggestion(id)
            .pipe(
                map((suggestions: ISuggestion[]) => {
                    const [suggestion] = suggestions
                    return suggestion
                }),
                mergeMap((suggestion: ISuggestion) => {
                    return this.votes.getVote(suggestion._id)
                        .pipe(
                            map((votes: any) => {
                                const [vote] = votes
                                return Object.assign({}, suggestion, {
                                    votes: vote
                                })
                            })
                        )
                })
            )
    }

    getManySuggestions(id: string, key: string) {
        return combineQueries([
            this.suggestions.selectAll({
                filterBy: entity => entity[key] === id
            }),
            this.votes.selectAll({ asObject: true }),
        ])
            .pipe(
                map(([suggestions, votes]) => {
                    return suggestions.slice().map((suggestion: ISuggestion) => {
                        return Object.assign({}, suggestion, {
                            votes: votes[suggestion._id]
                        })
                    })
                }),
                mergeMap((suggestions: ISuggestion[]) => {
                    return combineQueries([
                        this.suggestions.selectFilter$,
                        this.suggestions.selectOrder$
                    ]).pipe(
                        map(([filter, order]) => {
                            return this.suggestions.sortSuggestions(filter, order, suggestions)
                        })
                    )
                })
            )
    }

    getUsersSuggestions() {
        return combineQueries([
            this.suggestions.getUsersSuggestions(),
            this.votes.selectAll({ asObject: true }),
        ]).pipe(
            map(([suggestions, votes]) => {
                return suggestions.slice().map((suggestion: ISuggestion) => {
                    return Object.assign({}, suggestion, {
                        votes: votes[suggestion._id]
                    })
                })
            }),
            mergeMap((suggestions: ISuggestion[]) => {
                return combineQueries([
                    this.suggestions.selectFilter$,
                    this.suggestions.selectOrder$
                ]).pipe(
                    map(([filter, order]) => {
                        return this.suggestions.sortSuggestions(filter, order, suggestions)
                    })
                )
            })
        )
    }

    // Issue: Nested entities do not have the latest vote data
    // breaks nested vote buttons on template

    // Solution: Create a function which populates nested entities with vote data

    // Primary collection should be from secondary entities from a collection
    // i.e proposals on a Solution
    // Secondary collection should be from the akita store & a hashmap
    // Intended to populate the Primary collections with latest vote data
    populateCollection(primaryCollection: any, secondaryCollection: any, votes: any) {
        return primaryCollection.slice()
            .filter((item: any) => {
                const id = item._id ? item._id : item
                return secondaryCollection[id]
            })
            .map((item: any) => {
                // if item._id does not exist we have an unpopulated array
                // of objectIds
                const id = item._id ? item._id : item
                return Object.assign({}, secondaryCollection[id], {
                    votes: votes[id] || null
                })
            })
    }
}
