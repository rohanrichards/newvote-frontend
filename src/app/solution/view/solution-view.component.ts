import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';
import { ProposalService } from '@app/core/http/proposal/proposal.service';

import { optimizeImage } from '@app/shared/helpers/cloudinary';
import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { Suggestion } from '@app/core/models/suggestion.model';
import { OrganizationService } from '@app/core';

@Component({
	selector: 'app-solution',
	templateUrl: './solution-view.component.html',
	styleUrls: ['./solution-view.component.scss'],
	animations: [
    	trigger('fadeIn', fadeIn(':enter')) 
	]
})
export class SolutionViewComponent implements OnInit {

	solution: Solution;
	isLoading: boolean;
	loadingState: string;
	handleImageUrl = optimizeImage;
	organization: any;
	suggestions: any[];

	constructor(
		private organizationService: OrganizationService,
		private suggestionService: SuggestionService,
		private stateService: StateService,
		private solutionService: SolutionService,
		private voteService: VoteService,
		private proposalService: ProposalService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private meta: MetaService,
	) { }

	ngOnInit() {
		this.organizationService.get()
			.subscribe((org) => this.organization = org);
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.stateService.setLoadingState(AppState.loading);

		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getSolution(ID);
			this.getSuggestions(ID);
		});
	}

	getSolution(id: string, forceUpdate?: boolean) {
		const isOwner = this.auth.isOwner();

		this.solutionService.view({
			id: id,
			orgs: [],
			forceUpdate,
			params: isOwner ? { 'showDeleted': true } :  {}
		})
		.subscribe(
			(solution: Solution) => {
				this.solution = solution;
				this.meta.updateTags(
					{
						title: solution.title,
						appBarTitle: 'View Solution',
						description: solution.description,
						image: solution.imageUrl
					});

				return this.stateService.setLoadingState(AppState.complete);
			},
			(err) => {
				return this.stateService.setLoadingState(AppState.serverError);
			}
		);
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
				this.suggestions = suggestions;
			},
			(err) => err
		)
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
			.pipe(finalize(() => this.isLoading = false ))
			.subscribe(
				(res) => {
					this.openSnackBar('Your vote was recorded', 'OK');
					this.getSolution(this.solution._id, true);
				},
				(error) => {
					if (error.status === 401) {
						this.openSnackBar('You must be logged in to vote', 'OK');
					} else {
						this.openSnackBar('There was an error recording your vote', 'OK');
					}
				}
			);
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

	onSoftDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Remove Solution?`,
				message: `Are you sure you want to remove${this.solution.title}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.solution.softDeleted = true;
				this.solutionService.update({ id: this.solution._id, entity: this.solution }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
				});
			}
		});
	}

	onRestore() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore Solution?`,
				message: `Are you sure you want to restore ${this.solution.title}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.solution.softDeleted = false;
				this.solutionService.update({ id: this.solution._id, entity: this.solution }).subscribe(() => {
					this.openSnackBar('Succesfully restored', 'OK');
					this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
				});
			}
		});
	}

	onRestoreProposal(event: any) {
		this.isLoading = true;
		event.softDeleted = false;

		this.proposalService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.openSnackBar('Succesfully Restored', 'OK');
				this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
			});
	}

	onSoftDeleteProposal(event: any) {
		this.isLoading = true;
		event.softDeleted = true;

		this.proposalService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.openSnackBar('Succesfully removed', 'OK');
				this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
			});
	}

	onDeleteProposal(event: any) {
		this.proposalService.delete({ id: event._id }).subscribe(() => {
			this.openSnackBar('Succesfully deleted', 'OK');
			this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	populateSuggestion() {
		const {_id, title } = this.solution;
		const suggestionParentInfo = {
			_id,
			parentTitle: title,
			parentType: 'solution',
		}

		this.router.navigateByUrl('/suggestions/create', { 
			state: {
				...suggestionParentInfo
			}
		})
	}

	handleSuggestionSubmit(formData: any) {
		const suggestion = <Suggestion>formData;
		suggestion.organizations = this.organization;

		delete suggestion.type;
		
		suggestion.parent = this.solution._id;
		suggestion.parentType = 'Solution';
		suggestion.parentTitle = this.solution.title;

		this.suggestionService.create({ entity: suggestion })
			.subscribe(t => {
				this.openSnackBar('Succesfully created', 'OK');
			},
			(error) => {
				this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
			})
	}
}
