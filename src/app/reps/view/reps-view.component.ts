import { Component, OnInit } from '@angular/core';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { Observable, forkJoin } from 'rxjs';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { AdminService } from '@app/core/http/admin/admin.service';
import { Solution } from '@app/core/models/solution.model';
import { Issue } from '@app/core/models/issue.model';
import { Suggestion } from '@app/core/models/suggestion.model';
import { IssueQuery } from '@app/core/http/issue/issue.query';
import { SolutionQuery } from '@app/core/http/solution/solution.query';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { IssueService } from '@app/core/http/issue/issue.service';
@Component({
    selector: 'app-reps-view',
    templateUrl: './reps-view.component.html',
    styleUrls: ['./reps-view.component.scss']
})
export class RepsViewComponent implements OnInit {
    isLoading: boolean;
    loadingState: any;
    handleImageUrl = optimizeImage;
    imageUrl = 'https://images.unsplash.com/photo-1580076217624-5165cb3a0ed3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
    reps: any;

    proposals$: Observable<Proposal[]>;
    solutions$: Observable<Solution[]>;
    issues$: Observable<Issue[]>;
    suggestions$: Observable<Suggestion[]>;
    constructor(
        private proposalQuery: ProposalQuery,
        private proposalService: ProposalService,
        private auth: AuthenticationQuery,
        private issueQuery: IssueQuery,
        private solutionQuery: SolutionQuery,
        private solutionService: SolutionService,
        private issueService: IssueService,
        public admin: AdminService,

    ) { }

    ngOnInit() {
        // this.fetchData()
        // this.subscribeToProposalStore()
        this.subscribeToIssuesStore()
        this.subscribeToSolutionStore()
        this.subscribeToProposalStore()
        this.fetchData()
    }

    subscribeToIssuesStore() {
        this.issues$ = this.issueQuery.selectAll({})
    }

    subscribeToSolutionStore() {
        this.solutions$ = this.solutionQuery.selectAll({})
    }

    subscribeToProposalStore() {
        this.proposals$ = this.proposalQuery.selectAll({})
    }

    fetchData() {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        this.isLoading = true
        // this.stateService.setLoadingState(AppState.loading)

        const getSolutions = this.solutionService.list({ params })
        const getProposals = this.proposalService.list({ params })
        const getIssues = this.issueService.list({ params })
        
        forkJoin({
            solutions: getSolutions,
            proposals: getProposals,
            issues: getIssues
        })
            .subscribe(
                () => {
                    // this.stateService.setLoadingState(AppState.complete)
                },
                () => {
                    // return this.stateService.setLoadingState(AppState.error)
                }
            )
    }

}
