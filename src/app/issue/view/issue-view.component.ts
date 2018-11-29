import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';

import { IIssue } from '@app/core/models/issue.model';
import { Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-view.component.html',
	styleUrls: ['./issue-view.component.scss']
})
export class IssueViewComponent implements OnInit {

	issue: IIssue;
	solutions: Array<Solution>;
	isLoading: boolean;

	constructor(
		private issueService: IssueService,
		private solutionService: SolutionService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar
	) { }

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getIssue(ID);
		});
	}

	getIssue(id: string) {
		this.issueService.view({ id: id, orgs: [] })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((issue: IIssue) => {
				this.issue = issue;
				this.getSolutions(issue._id);
			});
	}

	getSolutions(id: string, forceUpdate?: boolean) {
		this.solutionService.list({ params: { issueId: id }, forceUpdate })
			.subscribe((solutions: Array<Solution>) => {
				this.solutions = solutions;
			});
	}

	onVote(voteData: any) {
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Solution', voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote }).subscribe(res => {
			this.getSolutions(this.issue._id, true);
		});
	}

	onDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete Issue?`,
				message: `Are you sure you want to delete ${this.issue.name}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.issueService.delete({ id: this.issue._id }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/issues', { forceUpdate: true }]);
				});
			}
		});
	}

	onDeleteSolution() {
		// const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
		// 	width: '250px',
		// 	data: {
		// 		title: `Delete Solution?`,
		// 		message: `Are you sure you want to delete ${this.issue.name}? This action cannot be undone.`
		// 	}
		// });
		//
		// dialogRef.afterClosed().subscribe((confirm: boolean) => {
		// 	if (confirm) {
		// 		this.issueService.delete({ id: this.issue._id }).subscribe(() => {
		// 			this.openSnackBar('Succesfully deleted', 'OK');
		// 			this.router.navigate(['/issues', { forceUpdate: true }]);
		// 		});
		// 	}
		// });
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

}
