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
import { RepQuery } from '@app/core/http/rep/rep.query';
import { RepService } from '@app/core/http/rep/rep.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model';
import { MetaService } from '@app/core/meta.service';
import { OrganizationQuery } from '@app/core/http/organization/organization.query';
import { Organization } from '@app/core/models/organization.model';
import { IRep } from '@app/core/models/rep.model';
@Component({
    selector: 'app-reps-view',
    templateUrl: './reps-view.component.html',
    styleUrls: ['./reps-view.component.scss']
})
export class RepsViewComponent implements OnInit {
    defaultImage = "assets/logo-no-text.png"
    isLoading: boolean;
    loadingState: any;
    handleImageUrl = optimizeImage;
    imageUrl: string;
    rep: any;

    proposals$: Observable<Proposal[]>;
    solutions$: Observable<Solution[]>;
    issues$: Observable<Issue[]>;
    suggestions$: Observable<Suggestion[]>;

    issues: any[] = []
    proposals: any[] = []
    solutions: any[] = []
    constructor(
        private proposalQuery: ProposalQuery,
        private proposalService: ProposalService,
        public auth: AuthenticationQuery,
        private issueQuery: IssueQuery,
        private solutionQuery: SolutionQuery,
        private solutionService: SolutionService,
        private issueService: IssueService,
        public admin: AdminService,
        public repQuery: RepQuery,
        private repService: RepService,
        private route: ActivatedRoute,
        private stateService: StateService,
        private meta: MetaService,
        private org: OrganizationQuery
    ) { }

    ngOnInit() {
        this.isLoading = true
        this.fetchData()

        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')

            this.repService.view({ id: ID, orgs: [] })
                .subscribe(
                    (res) => {
                        this.isLoading = false
                    },
                    (err) => err
                )
            this.subscribeToRepStore(ID)
        })
    }

    updateTags(organization: Organization, rep: IRep) {
        this.meta.updateTags(
            {
                title: `View ${organization.representativeTitle}`,
                appBarTitle: `View ${organization.representativeTitle}`,
                description: rep.description,
                image: rep.imageUrl
            })
    }

    // subscribe after getting rep so can pass in the rep object
    subscribeToOrgStore(rep: any) {
        this.org.select()
            .subscribe((org: any) => {
                if (!org) return false
                this.updateTags(org, rep)
            })
    }

    subscribeToIssuesStore(issues: any[]) {
        this.issueQuery.issues$
            .pipe(
                map((items: any[]) => {
                    return items.filter((res) => {
                        return issues.find((item) => {
                            return item._id === res._id || item === res._id
                        })
                    })
                })
            )
            .subscribe((res: any[]) => {
                if (!res.length) return false
                this.issues = res
            })
    }

    subscribeToSolutionStore(solutions: any[]) {

        this.solutionQuery.solutions$
            .pipe(
                map((items: any[]) => {
                    return items.filter((res) => {
                        return solutions.find((item) => {
                            return item._id === res._id || item === res._id
                        })
                    })
                })
            )
            .subscribe((res: any[]) => {
                if (!res.length) return false
                this.solutions = res
            })
    }

    subscribeToProposalStore(proposals: any[]) {
        this.proposalQuery.proposals$
            .pipe(
                map((items: any[]) => {
                    return items.filter((res) => {
                        return proposals.find((item) => {
                            return item._id === res._id || item === res._id
                        })
                    })
                })
            )
            .subscribe((res: any[]) => {
                if (!res.length) return false
                this.proposals = res
            })
    }

    subscribeToRepStore(ID: string) {
        this.repQuery.selectAll({
            filterBy: (rep) => rep._id === ID
        }).subscribe((res: any[]) => {
            if (!res.length) return false
            this.rep = res[0]

            const { proposals, solutions, issues } = res[0]
            this.subscribeToIssuesStore(issues)
            this.subscribeToSolutionStore(solutions)
            this.subscribeToProposalStore(proposals)
            this.subscribeToOrgStore(this.rep)
            this.stateService.setLoadingState(AppState.complete)
        })
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
                    this.isLoading = false
                    // this.stateService.setLoadingState(AppState.complete)
                },
                () => {
                    // return this.stateService.setLoadingState(AppState.error)
                }
            )
    }

    // if using default image don't add the image as background
    // blur is added by cloudinary so if using default, don't display as background
    checkDefaultImage(image: string) {
        if (image === this.defaultImage) return false
        return image
    }

}
