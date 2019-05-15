import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { differenceWith as _differenceWith } from 'lodash';
import { isEqual as _isEqual } from 'lodash';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { MediaService } from '@app/core/http/media/media.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { IIssue } from '@app/core/models/issue.model';
import { Solution } from '@app/core/models/solution.model';
import { Media } from '@app/core/models/media.model';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-view.component.html',
	styleUrls: ['./issue-view.component.scss']
})
export class IssueViewComponent implements OnInit {

	issue: IIssue;
	solutions: Array<Solution>;
	media: Array<Media>;
	isLoading: boolean;
	voteSnack: any;
	headingEdit = false;
	isMod: boolean;

	constructor(
		private topicService: TopicService,
		private issueService: IssueService,
		private solutionService: SolutionService,
		private mediaService: MediaService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getIssue(ID);
		});

		this.isMod = this.auth.isModerator()
	}

	getIssue(id: string) {
		this.issueService.view({ id: id, orgs: [] })
			.subscribe((issue: IIssue) => {
				this.issue = issue;
				this.getSolutions(issue._id);
				this.meta.updateTags(
					{
						title: this.issue.name,
						appBarTitle: 'View Issue',
						description: this.issue.description,
						image: this.issue.imageUrl
					});
			});
	}

	getSolutions(id: string, forceUpdate?: boolean) {
		this.solutionService.list({ params: { issueId: id }, forceUpdate })
			.subscribe((solutions: Array<Solution>) => {
				this.solutions = solutions.sort((a: Solution, b: Solution) => b.votes.up - a.votes.up);
				// console.log('got solutions: ', solutions);
				this.getMedia(id);
			});
	}

	getMedia(id: string, forceUpdate?: boolean) {
		this.mediaService.list({ params: { issueId: id }, forceUpdate })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((mediaList: Array<Media>) => {
				this.media = mediaList;
				// console.log('got media: ', mediaList);
			});
	}

	refreshData(issueId: string) {
		this.isLoading = true;
		this.solutionService.list({ params: { issueId }, forceUpdate: true })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(solutions => {
				const diff = _differenceWith(solutions, this.solutions, _isEqual);
				if (diff.length > 0) {
					const index = this.solutions.findIndex(s => s._id === diff[0]._id);
					this.solutions[index] = diff[0];
				}
			});
	}

	onVote(voteData: any, model: string) {
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
				this.refreshData(this.issue._id);
				this.getMedia(this.issue._id, true);
				this.openSnackBar('Your vote was recorded', 'OK');
			}
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
					this.router.navigate(['/issues'], { queryParams: { forceUpdate: true } });
				});
			}
		});
	}

	onMediaDelete(media: Media) {
		this.mediaService.delete({ id: media._id }).subscribe(() => {
			this.openSnackBar('Succesfully deleted', 'OK');
			this.getMedia(this.issue._id, true);
		});
	}

	onDeleteSolution(solution: any) {
		this.solutionService.delete({ id: solution._id }).subscribe(() => {
			this.openSnackBar('Succesfully deleted', 'OK');
			this.getSolutions(this.issue._id, true);
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right',
			verticalPosition: 'bottom',
		});
	}

	toggleHeader() {
		this.headingEdit = this.headingEdit ? false : true;
	}

	handleSubmit(value?: string) {
		this.toggleHeader();
		if (!value) {
			console.log(this.issue.mediaHeading);
			return;
		}

		this.issue.mediaHeading = value;
		this.issueService.update({ id: this.issue._id, entity: this.issue })
			.subscribe((t) => {
				this.issue = t;
			});
	}

}
