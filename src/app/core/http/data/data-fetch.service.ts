import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService } from '../issue/issue.service';
import { SolutionService } from '../solution/solution.service';
import { ProposalService } from '../proposal/proposal.service';
import { RepService } from '../rep/rep.service';
import { SuggestionService } from '../suggestion/suggestion.service';
import { TopicService } from '../topic/topic.service';
import { forkJoin } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataFetchService {

    constructor(
        private auth: AuthenticationService,
        private topicService: TopicService,
        private issueService: IssueService,
        private solutionService: SolutionService,
        private proposalService: ProposalService,
        private suggestionService: SuggestionService,
        private repService: RepService,
    ) { }

    // fetches all entity data
    get() {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        const getSolutions = this.solutionService.list({ params })
        const getProposals = this.proposalService.list({ params })
        const getIssues = this.issueService.list({ params })
        const getTopics = this.topicService.list({ params })
        const getSuggestions = this.suggestionService.list({ params })
        const getReps = this.repService.list({ params })

        return forkJoin({
            topics: getTopics,
            issues: getIssues,
            solutions: getSolutions,
            proposals: getProposals,
            suggestions: getSuggestions,
            repService: getReps
        })
    }
}
