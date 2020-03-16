import { VoteStore } from "../vote/vote.store";
import { SolutionStore } from "../solution/solution.store";
import { ProposalStore } from "../proposal/proposal.store";
import { SuggestionStore } from "../suggestion/suggestion.store";
import { Injectable } from "@angular/core";

@Injectable()

export class EntityVotesStore {
    constructor(public Votes: VoteStore, public Solution: SolutionStore, public Proposal: ProposalStore, public Suggestion: SuggestionStore) {}
}
