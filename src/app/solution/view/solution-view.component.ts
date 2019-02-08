import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';

import { ISolution } from '@app/core/models/solution.model';
import { Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-solution',
	templateUrl: './solution-view.component.html',
	styleUrls: ['./solution-view.component.scss']
})
export class SolutionViewComponent implements OnInit {

	solution: ISolution;
	solutions: Array<Solution>;
	isLoading: boolean;

	constructor(
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
			this.getSolution(ID);
		});
	}

	getSolution(id: string, forceUpdate?: boolean) {
		this.solutionService.view({ id: id, orgs: [], forceUpdate })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((solution: ISolution) => {
				this.solution = solution;
			});
	}

	onVote(voteData: any, model: string) {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, model, voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote }).subscribe((res) => {
			if (res.error) {
				if (res.error.status === 401) {
					this.openSnackBar('You must be logged in to vote', 'OK');
				} else {
					this.openSnackBar('There was an error recording your vote', 'OK');
				}
			} else {
				this.openSnackBar('Your vote was recorded', 'OK');
				this.getSolution(this.solution._id, true);
			}
		});
	}

	onDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete Solution?`,
				message: `Are you sure you want to delete ${this.solution.title}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.solutionService.delete({ id: this.solution._id }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
				});
			}
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

}
