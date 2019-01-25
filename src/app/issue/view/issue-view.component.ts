import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { MediaService } from '@app/core/http/media/media.service';
import { VoteService } from '@app/core/http/vote/vote.service';

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
			.subscribe((issue: IIssue) => {
				this.issue = issue;
				this.getSolutions(issue._id);
			});
	}

	getSolutions(id: string, forceUpdate?: boolean) {
		this.solutionService.list({ params: { issueId: id }, forceUpdate })
			.subscribe((solutions: Array<Solution>) => {
				this.solutions = solutions;
				console.log('got solutions: ', solutions);
				this.getMedia(id);
			});
	}

	getMedia(id: string, forceUpdate?: boolean) {
		this.mediaService.list({ params: { issueId: id }, forceUpdate })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((mediaList: Array<Media>) => {
				this.media = mediaList;
				console.log('got media: ', mediaList);
			});
	}

	onVote(voteData: any, model: string) {
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, model, voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote }).subscribe(() => {
			this.getSolutions(this.issue._id, true);
			this.getMedia(this.issue._id, true);
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
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

}
