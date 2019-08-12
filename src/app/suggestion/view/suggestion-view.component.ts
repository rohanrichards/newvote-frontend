import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { ISuggestion, Suggestion } from '@app/core/models/suggestion.model';
import { Vote } from '@app/core/models/vote.model';
import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion-view.component.html',
	styleUrls: ['./suggestion-view.component.scss'],
	animations: [
    	trigger('fadeIn', fadeIn(':enter')) 
	]
})
export class SuggestionViewComponent implements OnInit {

	suggestion: Suggestion;
	suggestions: Array<Suggestion>;
	isLoading: boolean;
	loadingState: string;

	constructor(
		private stateService: StateService,
		private suggestionService: SuggestionService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private meta: MetaService,
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.stateService.setLoadingState(AppState.loading);

		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getSuggestion(ID);
		});
	}

	getSuggestion(id: string, forceUpdate?: boolean) {
		this.suggestionService.view({ id: id, forceUpdate })
			.subscribe(
				(suggestion: Suggestion) => {
					this.suggestion = suggestion;
					this.meta.updateTags(
						{
							title: `${this.suggestion.title}`,
							appBarTitle: 'View Suggestion',
							description: this.suggestion.description
						});
					return this.stateService.setLoadingState(AppState.complete);
				},
				(err) => {
					this.stateService.setLoadingState(AppState.serverError);
				}
			);
	}

	approveSuggestion() {
		this.suggestion.status = 1;
		this.updateSuggestion();
	}

	pendSuggestion() {
		this.suggestion.status = 0;
		this.updateSuggestion();
	}

	denySuggestion() {
		this.suggestion.status = -1;
		this.updateSuggestion();
	}

	updateSuggestion() {
		this.isLoading = true;
		this.suggestionService.update({ id: this.suggestion._id, entity: this.suggestion })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(
				(t) => {
					this.openSnackBar('Succesfully updated', 'OK');
					this.suggestion = t;
				},
				(error) => {
					this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
				}
		);
	}

	onVote(voteData: any) {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Suggestion', voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote })
			.pipe(finalize(() => this.isLoading = false ))
			.subscribe(
				(res) => {
						this.openSnackBar('Your vote was recorded', 'OK');
						this.getSuggestion(this.suggestion._id, true);
				},
				(error) => {
					if (error.status === 401) {
						this.openSnackBar('You must be logged in to vote', 'OK');
					} else {
						this.openSnackBar('There was an error recording your vote', 'OK');
					}
				},
			);
	}

	onDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete Suggestion?`,
				message: `Are you sure you want to delete ${this.suggestion.title}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.suggestionService.delete({ id: this.suggestion._id }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/suggestions'], { queryParams: { forceUpdate: true } });
				});
			}
		});
	}

	onSoftDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Remove Suggestion?`,
				message: `Are you sure you want to remove ${this.suggestion.title}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.suggestion.softDeleted = true;
				this.suggestionService.update({ id: this.suggestion._id, entity: this.suggestion })
					.subscribe(() => {
						this.openSnackBar('Succesfully removed', 'OK');
						this.router.navigate(['/suggestions'], { queryParams: { forceUpdate: true } });
					});
			}
		});
	}

	onRestore() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore Suggestion?`,
				message: `Are you sure you want to restore ${this.suggestion.title}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.suggestion.softDeleted = false;
				this.suggestionService.update({ id: this.suggestion._id, entity: this.suggestion })
					.subscribe(() => {
						this.openSnackBar('Succesfully restored', 'OK');
						this.router.navigate(['/suggestions'], { queryParams: { forceUpdate: true } });
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
