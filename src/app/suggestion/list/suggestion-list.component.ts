import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
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
	templateUrl: './suggestion-list.component.html',
	styleUrls: ['./suggestion-list.component.scss'],
	animations: [
    	trigger('fadeIn', fadeIn(':enter'))
	]
})
export class SuggestionListComponent implements OnInit {

	loadingState: string;
	suggestions: Array<any>;
	isLoading: boolean;
	headerTitle = 'Make a new contribution';
	headerText = 'Suggestions are a way for you to contribute to the discussion. \
		Start by checking if your idea already exists in the suggestion list below (vote on it to increase exposure). \
		If your idea doesn\'t already exist, use the create button below, the community leader will be notified.';
	headerButtons = [{
		text: 'New Suggestion',
		color: 'warn',
		routerLink: '/suggestions/create',
		role: 'user'
	}];

	constructor(private suggestionService: SuggestionService,
		private stateService: StateService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar,
		private meta: MetaService,
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		})

		this.stateService.setLoadingState(AppState.loading);

		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
		this.meta.updateTags(
			{
				title: 'All Suggestions',
				description: 'Showing all suggestions.'
			});
	}

	fetchData(force?: boolean) {
		const isOwner = this.auth.isOwner();

		this.suggestionService.list({
			forceUpdate: force,
			params: isOwner ? { 'showDeleted': true } :  {}
		})
		.subscribe(
			suggestions => {
				console.log(suggestions, 'this is suggestions');
				this.suggestions = suggestions;
				this.stateService.setLoadingState(AppState.complete);
			},
			err => {
				return this.stateService.setLoadingState(AppState.serverError);
			}
		);
	}

	onDelete(event: any) {
		this.suggestionService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

	onSoftDelete(event: any) {
		event.softDeleted = true;
		this.suggestionService.update({ id: event._id, entity: event }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

	onRestore(event: any) {
		event.softDeleted = false;
		this.suggestionService.update({ id: event._id, entity: event }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
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

		this.voteService.create({ entity: vote })
			.pipe(finalize(() => this.isLoading = false ))
			.subscribe((res) => {
				this.openSnackBar('Your vote was recorded', 'OK');
				this.fetchData(true);
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

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

}
