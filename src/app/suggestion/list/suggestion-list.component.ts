import { Component, OnInit } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { Suggestion } from '@app/core/models/suggestion.model';
import { Vote } from '@app/core/models/vote.model';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps';
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';
import { Observable, combineLatest } from 'rxjs';
import { assign } from 'lodash';
import { VotesQuery } from '@app/core/http/vote/vote.query';
import { AdminService } from '@app/core/http/admin/admin.service';

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
	suggestions: Array<Suggestion>;
	suggestions$: Observable<any>;
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

	stepsArray = [...JoyRideSteps];

	constructor(
		private suggestionService: SuggestionService,
		private query: SuggestionQuery,
		private stateService: StateService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		public snackBar: MatSnackBar,
		private meta: MetaService,
		private voteQuery: VotesQuery,
		public admin: AdminService
	) { }

	ngOnInit() {
		this.stateService.setLoadingState(AppState.loading);
		this.getSuggestions();
		this.fetchData();

		this.meta.updateTags(
			{
				title: 'All Suggestions',
				description: 'Showing all suggestions.'
			});

		this.stateService.loadingState$
			.subscribe(
				(res: any) => {
					this.loadingState = res;
				},
				err => err
			);
	}

	getSuggestions() {
		this.suggestions$ = this.query.selectAll({
			filterBy: (entity: any) => {
				const userId = this.auth.credentials.user._id;
				if (typeof entity.user === 'string') {
					return entity.user === userId;
				}

				return entity.user._id === userId;
			}
		})
	}

	fetchData() {
		const isOwner = this.auth.isOwner();
		const isVerified = this.auth.isVerified();
		let id;

		// Send user data so we can return only the users suggestions
		if (this.auth.credentials && this.auth.credentials.user) {
			id = this.auth.credentials.user._id;
		}

		const options = {
			params: {
				'showDeleted': isOwner ? true : ''
			}
		};

		this.suggestionService.list(options)
			.subscribe(
				(res) => this.stateService.setLoadingState(AppState.complete),
				(err) => this.stateService.setLoadingState(AppState.error)
			);
	}

	onVote(voteData: any, model: string = 'Suggestion') {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Suggestion', voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote })
			.pipe(finalize(() => this.isLoading = false))
			.subscribe((res) => {
				this.updateEntityVoteData(item, model, res.voteValue);
				this.openSnackBar('Your vote was recorded', 'OK');
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


	updateEntityVoteData(entity: any, model: string, voteValue: number) {
		this.voteQuery.selectEntity(entity._id)
			.pipe(
				take(1)
			)
			.subscribe(
				(voteObj) => {
					// Create a new entity object with updated vote values from
					// vote object on store + voteValue from recent vote
					const updatedEntity = {
						votes: {
							...voteObj,
							currentUser: {
								voteValue: voteValue === 0 ? false : voteValue
							}
						}
					};

					if (model === "Suggestion") {
						return this.suggestionService.updateSuggestionVote(entity._id, updatedEntity);
					}
				},
				(err) => err
			)

	}

}