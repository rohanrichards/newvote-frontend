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
    reps: any;

    proposals: Proposal[];
    solutions: Solution[];
    issues: Issue[];
    suggestions: Suggestion[];

    constructor(
        public dialog: MatDialog,
        private proposalQuery: ProposalQuery,
        private proposalService: ProposalService,
        private auth: AuthenticationQuery,
        public admin: AdminService,
    ) { }

    ngOnInit() {
        this.fetchData()
        this.subscribeToProposalStore()
    }

    subscribeToProposalStore() {
        this.proposals$ = this.proposalQuery.selectAll({})
    }

    fetchData() {
        const isModerator = this.auth.isModerator()
        // this.isLoading = true
        const params = { softDeleted: isModerator ? true : '' }

        this.proposalService.list({ orgs: [], params })
            .subscribe(() => true)
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(RepModalComponent, {
            width: '400px',
            data: { repEmail: '', newReps: [], currentReps: ['Jamie', 'Craig'] }
        })

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                console.log('CLOSED')
            }
            console.log(result)
        })
    }
}
