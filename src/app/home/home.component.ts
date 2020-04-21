import { Component, OnInit } from '@angular/core'

import { OrganizationService } from '@app/core'
import { IssueService } from '@app/core/http/issue/issue.service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { UserService } from '@app/core/http/user/user.service'
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { MetaService } from '@app/core/meta.service'

import { Issue } from '@app/core/models/issue.model'
import { Organization, IOrganization } from '@app/core/models/organization.model'
import { optimizeImage } from '@app/shared/helpers/cloudinary'

import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { forkJoin } from 'rxjs'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { JoyrideService } from 'ngx-joyride'
import { MatSnackBar } from '@angular/material'

import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps'
import { IssueQuery } from '@app/core/http/issue/issue.query'

import { AdminService } from '@app/core/http/admin/admin.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { Proposal } from '@app/core/models/proposal.model'
import { Solution } from '@app/core/models/solution.model'
import { OrganizationQuery, CommunityQuery } from '@app/core/http/organization/organization.query'
import { ActivatedRoute } from '@angular/router'
import { OrganizationStore } from '@app/core/http/organization/organization.store'

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class HomeComponent implements OnInit {

    isLoading: boolean;
    org: Organization;
    issues: Issue[];
    solutions: any[];
    proposals: any[];
    userCount: number;
    loadingState: string;
    handleImageUrl = optimizeImage;
    loadTour = true;
    ISSUE_LIMIT = 6;
    stepsArray = [...JoyRideSteps];

    constructor(
        private readonly joyrideService: JoyrideService,
        public stateService: StateService,
        public auth: AuthenticationService,
        private organizationService: OrganizationService,
        private issueService: IssueService,
        private solutionService: SolutionService,
        private proposalService: ProposalService,
        private userService: UserService,
        private meta: MetaService,
        public snackBar: MatSnackBar,
        public admin: AdminService,
        private proposalQuery: ProposalQuery,
        private solutionQuery: SolutionQuery,
        private issueQuery: IssueQuery,
        private organizationQuery: OrganizationQuery,
        private communityQuery: CommunityQuery,
        private route: ActivatedRoute,
        private orgQuery: OrganizationQuery
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.route.params.subscribe(
            (res: any) => {
                const { id } = res
                if (!id) return false
                this.communityQuery.selectAll({
                    filterBy: (entity: any) => { return entity.url === id }
                })
                    .subscribe((res: Organization[]) => {
                        if (!res.length) return false
                        const [organization, ...rest] = res
                        this.org = organization
                        this.fetchData(id)
                        this.stateService.setLoadingState(AppState.complete)
                    })
            },
            (err: any) => {
                console.log(err)
            }
        )

        // this.subscribeToOrgStore()
        this.subscribeToIssueStore()
        this.subscribeToProposalStore()
        this.subscribeToSolutionStore()
    }

    fetchData(organization: any) {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        this.isLoading = true

        const getOrganization = this.organizationService.view({ id: this.org._id, params })
        const getSolutions = this.solutionService.list({ orgs: [organization], params })
        const getProposals = this.proposalService.list({ orgs: [organization], params })
        const getIssues = this.issueService.list({ orgs: [organization], params })
        const getUsers = this.userService.count()

        forkJoin({
            organization: getOrganization,
            solutions: getSolutions,
            proposals: getProposals,
            count: getUsers,
            issues: getIssues
        })
            .subscribe(
                ({ count }) => {
                    this.userCount = count || 5
                },
                () => {
                    return this.stateService.setLoadingState(AppState.error)
                }
            )
    }

    subscribeToOrgStore() {
        this.organizationQuery.select()
            .subscribe((res) => {
                if (!res._id) return false
                this.org = res

                this.meta.updateTags(
                    {
                        title: 'Community Home',
                        image: res.imageUrl,
                        description: res.description
                    })

                // this.stateService.setLoadingState(AppState.complete)
            })
    }

    subscribeToIssueStore() {
        this.issueQuery.issues$
            .subscribe((issues: Issue[]) => {
                this.issues = issues
            })
    }

    subscribeToProposalStore() {
        this.proposalQuery.proposals$
            .subscribe((proposals: Proposal[]) => {
                this.proposals = proposals
            })
    }

    subscribeToSolutionStore() {
        this.solutionQuery.solutions$
            .subscribe((solutions: Solution[]) => {
                this.solutions = solutions
            })
    }

    onDone() {
        return this.completeTour()
    }

    startTour(event: any) {
        event.stopPropagation()
        this.joyrideService.startTour(
            {
                steps: ['step1@home', 'step2@home', 'step3@home', 'issues1@issues',
                    'solution1@solutions', 'suggestion1@suggestions', 'finish@home'],
                showPrevButton: true,
                stepDefaultPosition: 'center',
                waitingTime: 1150,
            }
        )
    }

    completeTour() {
        const user = this.auth.credentials.user
        user.completedTour = true
        this.userService.patch({ id: user._id, entity: user })
            .subscribe(
                () => {
                    this.auth.saveTourToLocalStorage()
                    this.admin.openSnackBar('Tour Complete', 'OK')
                },
                (err) => err
            )
    }

}
