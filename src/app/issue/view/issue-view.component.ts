import { Component, OnInit, ViewChild, forwardRef, Inject, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { differenceWith } from 'lodash';
import { isEqual } from 'lodash';

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

import { optimizeImage } from '@app/shared/helpers/cloudinary';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { ShellComponent } from '@app/shell/shell.component';
import { Suggestion } from '@app/core/models/suggestion.model';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { OrganizationService } from '@app/core';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-view.component.html',
	styleUrls: ['./issue-view.component.scss'],
	animations: [
		trigger('fadeIn', fadeIn(':enter'))
	]
})
export class IssueViewComponent implements OnInit {

	issue: IIssue;
	solutions: Array<Solution>;
	media: Array<Media>;
	isLoading: boolean;
	voteSnack: any;
	headingEdit = false;
	loadingState: string;
	handleImageUrl = optimizeImage;
	isOpen = false;
	organization: any;
	suggestions: any;

	constructor(
		private organizationService: OrganizationService,
		private suggestionService: SuggestionService,
		private stateService: StateService,
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
		private meta: MetaService,
		@Inject(forwardRef(() => ShellComponent)) private shellComponent: ShellComponent
	) { }

	ngOnInit() {
		this.organizationService.get()
			.subscribe(
				(org) => this.organization = org,
				(err) => err);

		this.stateService.loadingState$.subscribe((state) => this.loadingState = state);

		this.stateService.setLoadingState(AppState.loading);

		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getIssue(ID);
			this.getSuggestions(ID);
		});
	}
	
	getSuggestions(id: string) {
		const isOwner = this.auth.isOwner();

		this.suggestionService.list({
			params: {
				'showDeleted': isOwner ? true : false,
				'parent': id
			}
		})
		.subscribe(
			(suggestions) => {
				console.log(suggestions, 'this is suggestions');
				this.suggestions = suggestions;
			},
			(err) => err
		)
	}

	getIssue(id: string) {
		this.issueService.view({ id: id, orgs: [] })
			.subscribe(
				(issue: IIssue) => {
					this.issue = issue;
					this.getSolutions(issue._id);
					this.meta.updateTags(
						{
							title: this.issue.name,
							appBarTitle: 'View Issue',
							description: this.issue.description,
							image: this.issue.imageUrl
						});
					this.stateService.setLoadingState(AppState.complete);
				},
				(error) => this.stateService.setLoadingState(AppState.serverError)
			);
	}

	getSolutions(id: string, forceUpdate?: boolean) {
		const isOwner = this.auth.isOwner();

		this.solutionService.list({
			params: isOwner
				? { issueId: id, 'showDeleted': true }
				: { issueId: id },
			forceUpdate,
		})
			.subscribe((solutions: Array<Solution>) => {
				this.solutions = solutions.sort((a: Solution, b: Solution) => b.votes.up - a.votes.up);
				this.getMedia(id);
			});
	}

	getMedia(id: string, forceUpdate?: boolean) {
		const isOwner = this.auth.isOwner();

		this.mediaService.list({
			params: isOwner
				? { issueId: id, 'showDeleted': true }
				: { issueId: id },
			forceUpdate,
		})
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((mediaList: Array<Media>) => {
				this.media = mediaList;
			});
	}

	refreshData(issueId: string) {
		this.isLoading = true;
		this.solutionService.list({ params: { issueId }, forceUpdate: true })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(solutions => {
				const diff = differenceWith(solutions, this.solutions, isEqual);
				if (diff.length > 0) {
					const index = this.solutions.findIndex(s => s._id === diff[0]._id);
					this.solutions[index] = diff[0];
				}
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

		this.voteService.create({ entity: vote })
			.pipe(finalize(() => this.isLoading = false))
			.subscribe(
				(res) => {
					this.refreshData(this.issue._id);
					this.getMedia(this.issue._id, true);
					this.openSnackBar('Your vote was recorded', 'OK');
				},
				(error) => {
					if (error) {
						if (error.status === 401) {
							this.openSnackBar('You must be logged in to vote', 'OK');
						} else {
							this.openSnackBar('There was an error recording your vote', 'OK');
						}
					}
				}
			);
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

	onSoftDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Remove ${this.issue.name}?`,
				message: `Are you sure you want to remove ${this.issue.name}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.issue.softDeleted = true;
				this.issueService.update({ id: this.issue._id, entity: this.issue }).subscribe(() => {
					this.openSnackBar('Succesfully removed', 'OK');
					this.router.navigate(['/issues'], { queryParams: { forceUpdate: true } });
				});
			}
		});
	}

	onRestore() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore ${this.issue.name}?`,
				message: `Are you sure you want to restore ${this.issue.name}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.issue.softDeleted = false;
				this.issueService.update({ id: this.issue._id, entity: this.issue }).subscribe(() => {
					this.openSnackBar('Succesfully restored', 'OK');
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

	onMediaSoftDelete(media: Media) {
		media.softDeleted = true;
		this.mediaService.update({ id: media._id, entity: media }).subscribe(() => {
			this.openSnackBar('Succesfully removed', 'OK');
			this.getMedia(this.issue._id, true);
		});
	}

	onMediaRestore(media: Media) {
		media.softDeleted = false;
		this.mediaService.update({ id: media._id, entity: media }).subscribe(() => {
			this.openSnackBar('Succesfully removed', 'OK');
			this.getMedia(this.issue._id, true);
		});
	}

	onDeleteSolution(solution: any) {
		this.solutionService.delete({ id: solution._id }).subscribe(() => {
			this.openSnackBar('Succesfully deleted', 'OK');
			this.getSolutions(this.issue._id, true);
		});
	}

	onSoftDeleteSolution(solution: any) {
		solution.softDeleted = true;
		this.solutionService.update({ id: solution._id, entity: solution }).subscribe(() => {
			this.openSnackBar('Succesfully removed', 'OK');
			this.getSolutions(this.issue._id, true);
		});
	}

	onRestoreSolution(solution: any) {
		solution.softDeleted = false;
		this.solutionService.update({ id: solution._id, entity: solution }).subscribe(() => {
			this.openSnackBar('Succesfully removed', 'OK');
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
			return;
		}

		this.issue.mediaHeading = value;
		this.issueService.update({ id: this.issue._id, entity: this.issue })
			.subscribe((t) => {
				this.issue = t;
			});
	}

	toggleContent() {
		this.isOpen = this.isOpen ? false : true;
	}
	
	handleSuggestionSubmit(formData: any) {
		const suggestion = <Suggestion>formData;
		suggestion.organizations = this.organization;

		delete suggestion.type;

		suggestion.parent = this.issue._id;
		suggestion.parentType = 'Issue';
		suggestion.parentTitle = this.issue.name;

		this.suggestionService.create({ entity: suggestion })
			.subscribe(t => {
				this.openSnackBar('Succesfully created', 'OK');
			},
			(error) => {
				this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
			})
	}

	populateSuggestion() {
		const {_id, name: title } = this.issue;
		const suggestionParentInfo = {
			_id,
			parentTitle: title,
			parentType: 'issue',
		}

		this.router.navigateByUrl('/suggestions/create', {
			state: {
				...suggestionParentInfo
			}
		})
	}

}
