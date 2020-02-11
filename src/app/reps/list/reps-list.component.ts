import { Component, OnInit } from '@angular/core';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { Observable } from 'rxjs';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { AdminService } from '@app/core/http/admin/admin.service';
import { Solution } from '@app/core/models/solution.model';
import { Issue } from '@app/core/models/issue.model';
import { Suggestion } from '@app/core/models/suggestion.model';
import { MatDialogRef, MatDialog } from '@angular/material';
import { RepModalComponent } from '@app/shared/rep-modal/rep-modal.component';
import { Rep } from '@app/core/models/rep.model';
import { RepService } from '@app/core/http/rep/rep.service';
import { RepQuery } from '@app/core/http/rep/rep.query';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { MetaService } from '@app/core/meta.service';
import { OrganizationService } from '@app/core';
import { OrganizationQuery } from '@app/core/http/organization/organization.query';
import { Organization } from '@app/core/models/organization.model';
@Component({
    selector: 'app-reps-list',
    templateUrl: './reps-list.component.html',
    styleUrls: ['./reps-list.component.scss']
})

export class RepsListComponent implements OnInit {
    isLoading: boolean;
    loadingState: any;
    proposals$: Observable<Proposal[]>;
    handleImageUrl = optimizeImage;
    imageUrl = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FAyyM_Yxlmx4%2Fmaxresdefault.jpg&f=1&nofb=1'
    reps: any[];
    proposals: Proposal[];
    solutions: Solution[];
    issues: Issue[];
    suggestions: Suggestion[];

    constructor(
        public dialog: MatDialog,
        private repsService: RepService,
        private repQuery: RepQuery,
        private proposalQuery: ProposalQuery,
        private proposalService: ProposalService,
        private solutionService: SolutionService,
        private issueService: IssueService,
        public auth: AuthenticationQuery,
        public admin: AdminService,
        private meta: MetaService,
        private organizationQuery: OrganizationQuery
    ) { }

    ngOnInit() {
        this.fetchData()
        this.subscribeToOrgStore()
        // this.subscribeToProposalStore()
    }

    updateTags(organization: Organization) {
        this.meta.updateTags(
            {
                title: `All ${organization.representativeTitle}`,
                appBarTitle: `All ${organization.representativeTitle}`,
                description: `View all of ${organization.name} community on the NewVote platform.`
            })
    }

    subscribeToOrgStore() {
        this.organizationQuery.select()
            .subscribe((org: any) => {
                if (!org) return false
                this.updateTags(org)
            })
    }

    // Called in services so not to throw errors not finding reps
    subscribeToRepStore() {
        this.repQuery.populateReps()
            .subscribe(
                (reps: any[]) => {
                    if (!reps.length) return false
                    this.reps = reps
                },
                (err) => err
            )
    }

    // subscribeToProposalStore() {
    //     this.proposals$ = this.proposalQuery.selectAll({})
    // }

    fetchData() {
        const isModerator = this.auth.isModerator()
        // this.isLoading = true
        const params = { softDeleted: isModerator ? true : '' }

        this.proposalService.list({ orgs: [], params })
            .subscribe((res) => res)

        this.repsService.list({ orgs: [], params })
            .subscribe((res) => {
                this.subscribeToRepStore()
            })

        this.solutionService.list({ orgs: [], params })
            .subscribe((res) => res)

        this.issueService.list({ orgs: [], params })
            .subscribe((res) => res)
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(RepModalComponent, {
            width: '400px',
            data: { repEmail: '', newReps: [], currentReps: this.reps, removeReps: [] }
        })

        dialogRef.afterClosed().subscribe(result => {
            if (!result) return false
            const { newReps, removeReps, currentReps } = result
            if (removeReps.length) {
                this.deleteReps(removeReps)
            }
            if (newReps.length) {
                this.createReps({ newReps, currentReps })
            }
        })
    }

    createReps(reps: any) {
        this.repsService.create({ entity: reps })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    deleteReps(reps: any) {
        this.repsService.deleteMany({ entity: reps })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }
}
