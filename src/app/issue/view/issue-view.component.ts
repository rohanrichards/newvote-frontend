import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import {
	SwiperComponent, SwiperDirective, SwiperConfigInterface,
	SwiperScrollbarInterface, SwiperPaginationInterface
} from 'ngx-swiper-wrapper';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
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
	@ViewChild(SwiperComponent) componentRef?: SwiperComponent;
	@ViewChild(SwiperDirective) directiveRef?: SwiperDirective;

	issue: IIssue;
	solutions: Array<Solution>;
	media: Array<Media>;
	isLoading: boolean;
	swiperIndex: number;

	public config: SwiperConfigInterface = {
		a11y: true,
		direction: 'horizontal',
		slidesPerView: 1,
		spaceBetween: 40,
		keyboard: true,
		mousewheel: false,
		scrollbar: false,
		navigation: true,
		pagination: true,
		observer: true,
		autoHeight: true,
		loop: true,
		loopAdditionalSlides: 2,
		loopFillGroupWithBlank: true,
		initialSlide: 0
	};

	private scrollbar: SwiperScrollbarInterface = {
		el: '.swiper-scrollbar',
		hide: false,
		draggable: true
	};

	private pagination: SwiperPaginationInterface = {
		el: '.swiper-pagination',
		clickable: true,
		hideOnClick: false
	};

	constructor(
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
				console.log(this.swiperIndex);
				this.swiperIndex = 0;
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
