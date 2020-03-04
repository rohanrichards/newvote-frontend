import { Injectable } from "@angular/core";
import { VotesQuery } from "../vote/vote.query";
import { SolutionQuery } from "../solution/solution.query";
import { ProposalQuery } from "../proposal/proposal.query";
import { SuggestionQuery } from "../suggestion/suggestion.query";
import { forkJoin, combineLatest } from "rxjs";
import { combineQueries } from "@datorama/akita";
import { map } from "rxjs/operators";
import { Solution, ISolution } from "@app/core/models/solution.model";
import { Vote } from "@app/core/models/vote.model";
import { IProposal } from "@app/core/models/proposal.model";
import { ISuggestion } from "@app/core/models/suggestion.model";
import { orderBy } from 'lodash'
import { IIssue } from "@app/core/models/issue.model";

@Injectable()
export class EntityVotesQuery {
    // https://blog.angularindepth.com/plan-your-next-party-with-an-angular-invite-app-using-akita-422495351767
    sortedSolutions$ = combineLatest(this.solutions.selectFilter$, this.solutions.selectOrder$, this.solutionVotes$)
        .pipe(
            map(([filter, order, solutions]: any) => {
                return this.sortSolutions(filter, order, solutions)
            })
        )

    constructor(
        public votes: VotesQuery,
        public solutions: SolutionQuery,
        public proposals: ProposalQuery,
        public suggestions: SuggestionQuery) { }

    solutionVotes$(issueId?: string) {
        return combineQueries([
            this.solutions.getSolutions(issueId),
            this.votes.selectAll({ asObject: true }),
            this.proposals.getProposals(false, true)
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
                })
            )
    }

    proposalVotes$(solutionId: string) {
        return combineQueries([
            this.proposals.getProposals(solutionId, false),
            this.votes.selectAll({ asObject: true }),
        ])
            .pipe(
                map(([proposals, votes]) => {
                    return proposals.slice().map((proposal: IProposal) => {
                        return Object.assign({}, proposal, {
                            votes: votes[proposal._id]
                        })
                    })
                })
            )
    }

    suggestionVotes$() {
        return combineQueries([
            this.suggestions.selectAll(),
            this.votes.selectAll({ asObject: true }),
        ])
            .pipe(
                map(([suggestions, votes]) => {
                    return suggestions.slice().map((suggesiton: ISuggestion) => {
                        suggesiton.votes = votes[suggesiton._id]
                        return suggesiton
                    })
                })
            )
    }

    sortSolutions(filter: string, order: string, solutions: Solution[]) {
        const sortedOrder: any = order === 'ASCENDING' ? ['asc', 'desc'] : ['desc', 'asc']

        switch (filter) {
            case 'SHOW_ALL':
                return solutions
            case 'VOTES':
                return orderBy(solutions, ['votes.total'], sortedOrder)
            case 'ACTIONS':
                return orderBy(solutions, ['proposals.length'], sortedOrder)
            case 'TITLE':
                return orderBy(solutions, ['title'], sortedOrder)
        }
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
