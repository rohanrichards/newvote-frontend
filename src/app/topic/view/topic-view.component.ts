import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { MetaService } from '@app/core/meta.service';

import { ITopic, Topic } from '@app/core/models/topic.model';
import { optimizeImage } from '@app/shared/helpers/cloudinary';
import { TopicQuery } from '@app/core/http/topic/topic.query';
import { IssueQuery } from '@app/core/http/issue/issue.query';
import { Issue } from '@app/core/models/issue.model';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-view.component.html',
	styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent implements OnInit {

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
		private topicQuery: TopicQuery,
		private issueQuery: IssueQuery
	) { }

	ngOnInit() {
		this.meta.updateTags(
			{
				title: 'View Topic',
				description: 'Viewing a single topipc'
			});

		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.subscribeToTopicStore(ID);
			this.subscribeToIssueStore(ID)
			this.getTopic(ID);
			this.getIssues();

		});
	}

	subscribeToTopicStore(id: string) {
		this.topicQuery.selectEntity(id)
			.subscribe((topic: Topic) => this.topic = topic)
	}

	subscribeToIssueStore(id: string) {
		this.issueQuery.selectAll({
			filterBy: (entity) =>  {
				return entity.topics.some((topic) => {
					return topic._id === id;
				})
			}
		})
			.subscribe(
				(issues: Issue[]) => this.issues = issues,
				(err) => err
			)
	}

	getTopic(id: string) {
		this.topicService.view({ id: id, orgs: [] })
			.subscribe(
				(res) => res,
				(err) => err
			);
		
	}

	getIssues() {
		const isOwner = this.auth.isOwner();
		const options = { 
			params: {'showDeleted': isOwner ? true : '' }
		}
		this.issueService.list(options)
			.subscribe(
				(res) => res,
				(err) => err
			);
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
