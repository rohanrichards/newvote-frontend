import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService } from '../issue/issue.service';
import { SolutionService } from '../solution/solution.service';
import { ProposalService } from '../proposal/proposal.service';
import { RepService } from '../rep/rep.service';
import { SuggestionService } from '../suggestion/suggestion.service';
import { TopicService } from '../topic/topic.service';
import { forkJoin } from 'rxjs';
import { OrganizationService } from '../organization/organization.service';
import { MediaService } from '../media/media.service';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

type Services = {
    Topic: TopicService;
    Issue: IssueService;
    Suggestion: SuggestionService;
    Solution: SolutionService;
    Proposal: ProposalService;
    Media: MediaService;
    Organization: OrganizationService;
    Rep: RepService;
}

@Injectable({
    providedIn: 'root'
})
export class DataFetchService {

    constructor(
        private auth: AuthenticationService,
        private authQuery: AuthenticationQuery,
        private topicService: TopicService,
        private issueService: IssueService,
        private solutionService: SolutionService,
        private proposalService: ProposalService,
        private suggestionService: SuggestionService,
        private repService: RepService,
        private organizationService: OrganizationService,
        private mediaService: MediaService
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
        const getReps = this.repService.list()

        return forkJoin({
            topics: getTopics,
            issues: getIssues,
            solutions: getSolutions,
            proposals: getProposals,
            suggestions: getSuggestions,
            repService: getReps
        })
    }

    getHome() {
        const isModerator = this.authQuery.isModerator()
        const params = isModerator ? { showDeleted: isModerator } : {}

        const serviceObj = {
            issues: this.issueService.list({ params }),
            solutions: this.solutionService.list({ params }),
            proposals: this.proposalService.list({ params })
        }

        forkJoin(serviceObj)
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    getIssues() {
        const isModerator = this.authQuery.isModerator()
        const params = isModerator ? { showDeleted: isModerator } : {}

        const serviceObj = {
            topics: this.topicService.list({ params }),
            issues: this.issueService.list({ params }),
            suggestions: this.suggestionService.list({ params })
        }

        forkJoin(serviceObj)
            .subscribe(
                (res) => res,
                (err) => err
            )
    }
}
