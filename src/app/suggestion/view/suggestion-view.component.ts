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

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion-view.component.html',
	styleUrls: ['./suggestion-view.component.scss']
})
export class SuggestionViewComponent implements OnInit {

	suggestion: Suggestion;
	suggestions: Array<Suggestion>;
	isLoading: boolean;

	constructor(
		private suggestionService: SuggestionService,
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
			this.getSuggestion(ID);
		});
	}

	getSuggestion(id: string, forceUpdate?: boolean) {
		this.suggestionService.view({ id: id, forceUpdate })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((suggestion: Suggestion) => {
				this.suggestion = suggestion;
				this.meta.updateTags(
					{
						title: `${this.suggestion.title}`,
						appBarTitle: 'View Suggestion',
						description: this.suggestion.description
					});
			});
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
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.suggestion = t;
				}
			});
	}

	onVote(voteData: any) {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Suggestion', voteValue);
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
				this.getSuggestion(this.suggestion._id, true);
			}
		});
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

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

}
