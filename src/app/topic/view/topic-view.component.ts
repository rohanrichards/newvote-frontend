import { Component, OnInit, AfterViewInit, forwardRef, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { MetaService } from '@app/core/meta.service';

import { ITopic } from '@app/core/models/topic.model';
import { optimizeImage } from '@app/shared/helpers/cloudinary';
import { ShellComponent } from '@app/shell/shell.component';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-view.component.html',
	styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent implements OnInit, AfterViewInit {

	topic: ITopic;
	issues: Array<any>;
	isLoading: boolean;
	handleImageUrl = optimizeImage;

	constructor(
		private topicService: TopicService,
		private issueService: IssueService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private meta: MetaService,
		@Inject(forwardRef(() => ShellComponent)) private shellComponent: ShellComponent
	) { }

	ngOnInit() {
		this.meta.updateTags(
			{
				title: 'View Topic',
				description: 'Viewing a single topipc'
			});

		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getTopic(ID);
		});
	}

	ngAfterViewInit(): void {
		this.shellComponent.restoreScrollPosition();
	}

	getTopic(id: string) {
		this.topicService.view({ id: id, orgs: [] })
			.subscribe((topic: ITopic) => {
				this.topic = topic;
				this.getIssues(topic._id);
			});
	}

	getIssues(id: string) {
		this.issueService.list({ params: { topicId: id } })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((issues: Array<any>) => { this.issues = issues; });
	}

	onDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete Topic?`,
				message: `Are you sure you want to delete ${this.topic.name}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.topicService.delete({ id: this.topic._id }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/topics'], { queryParams: { forceUpdate: true } });
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
