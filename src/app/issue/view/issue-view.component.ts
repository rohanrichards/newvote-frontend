import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';

import { IIssue } from '@app/core/models/issue.model';
import { Solution } from '@app/core/models/solution.model';

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

	getSolutions(id: string) {
		this.solutionService.list({ params: { issueId: id } })
			.subscribe((solutions: Array<Solution>) => { this.solutions = solutions; });
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

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

}
