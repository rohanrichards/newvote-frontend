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

    solutionVotes$() {
        return combineQueries([
            this.solutions.solutions$,
            this.votes.selectAll({ asObject: true }),
            this.proposals.selectAll({ asObject: true })
        ])
            .pipe(
                map(([solutions, votes, proposals]) => {
                    return solutions.slice().map((solution: ISolution) => {
                        let { proposals: sProposals } = solution
                        if (!votes[solution._id]) {
                            return solution
                        }

                        if (solution.proposals.length) {
                            sProposals = sProposals.slice().map((item) => {
                                if (typeof item === 'string') {
                                    return proposals[item]
                                }
                                return item
                            })
                        }

                        return Object.assign({}, solution, {
                            votes: votes[solution._id],
                            proposals: sProposals
                        })
                    })
                })
            )
    }

    proposalVotes$() {
        return combineQueries([
            this.proposals.selectAll(),
            this.votes.selectAll({ asObject: true }),
        ])
            .pipe(
                map(([proposals, votes]) => {
                    return proposals.slice().map((proposal: IProposal) => {
                        proposal.votes = votes[proposal._id]
                        return proposal
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
}
