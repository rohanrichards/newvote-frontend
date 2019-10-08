import { Injectable } from '@angular/core';
import { TopicService } from '../topic/topic.service';
import { ProposalService } from '../proposal/proposal.service';
import { SolutionService } from '../solution/solution.service';
import { SuggestionService } from '../suggestion/suggestion.service';
import { IssueService } from '../issue/issue.service';


type Services = {
    Topic: TopicService,
    Action: ProposalService,
    Solution: SolutionService,
    Suggestion: SuggestionService,
    Issue: IssueService
}

@Injectable({
    providedIn: 'root'
})
export class SortingService {

    services: Services = {
        Topic: this.topicService,
        Action: this.proposalService,
        Solution: this.solutionService,
        Suggestion: this.suggestionService,
        Issue: this.issueService
    }

    constructor(
        private topicService: TopicService,
        private proposalService: ProposalService,
        private solutionService: SolutionService,
        private suggestionService: SuggestionService,
        private issueService: IssueService
    ) { }


    sortEntityBy(model: string, sort: string) {
        this.services[model].updateFilter(sort);
    }

    orderEntityBy(model: string, order: string) {
        this.services[model].updateOrder(order);
    }
}
