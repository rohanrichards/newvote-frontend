import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { differenceWith } from 'lodash';
import { isEqual, assign } from 'lodash';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { Suggestion } from '@app/core/models/suggestion.model';
import { OrganizationService } from '@app/core';
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';
import { forkJoin, Observable } from 'rxjs';
import { SolutionQuery } from '@app/core/http/solution/solution.query';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { VotesQuery } from '@app/core/http/vote/vote.query';

@Component({
	selector: 'app-solution',
	templateUrl: './solution-list.component.html',
	styleUrls: ['./solution-list.component.scss'],
	animations: [
		trigger('fadeIn', fadeIn(':enter'))
	]
})
export class SolutionListComponent implements OnInit {

	loadingState: string;
	solutions: Array<any>;
	isLoading: boolean;
	headerTitle = 'Browse By Solution';
	headerText = 'Solutions are the decisions that you think your community should make.';
	headerButtons = [{
		text: 'New Solution',
		color: 'warn',
		routerLink: '/solutions/create',
		role: 'admin'
	},
	{
		text: 'Make Suggestion',
		color: 'warn',
		routerLink: '/suggestions/create',
		role: 'user',
		params: { type: 'solution' }
	}];
	stepsArray = [...JoyRideSteps];

	suggestions: Array<any>;
	organization: any;

	constructor(
		private organizationService: OrganizationService,
		private stateService: StateService,
		private solutionService: SolutionService,
		private suggestionService: SuggestionService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private meta: MetaService,
		private suggestionQuery: SuggestionQuery,
		private solutionQuery: SolutionQuery,
		private proposalService: ProposalService,
		private proposalQuery: ProposalQuery,
		private voteQuery: VotesQuery
	) { }

	ngOnInit() {
		this.subscribeToSuggestionStore();
		this.subscribeToSolutionStore();

		this.organizationService.get()
			.subscribe((org) => this.organization = org);

		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.stateService.setLoadingState(AppState.loading);

		this.meta.updateTags(
			{
				title: 'All Solutions',
				description: 'Solutions are the decisions that you think your community should make.'
			});

		this.fetchData();
	}

	fetchData() {
		const isOwner = this.auth.isOwner();
		const options = { 'showDeleted': isOwner ? true : '' }

		const solutionObs: Observable<Solution[]> = this.solutionService.list({
			params: options
		});
		const suggestionObs: Observable<Suggestion[]> = this.suggestionService.list({ params: options })

		forkJoin([
			solutionObs,
			suggestionObs
		])
			.subscribe(
				response => this.stateService.setLoadingState(AppState.complete),
				err => this.stateService.setLoadingState(AppState.serverError)
			);

	}

	subscribeToSolutionStore() {
		this.solutionQuery.selectAll()
			.subscribe((solutions: Solution[]) => {
				this.solutions = solutions;
			})
	}

	subscribeToSuggestionStore() {
		this.suggestionQuery.selectAll({
			filterBy: entity => entity.type === 'solution'
		})
			.subscribe((suggestions: Suggestion[]) => {
				this.suggestions = suggestions;
			})
	}


	onRestore(event: any) {
		const entity = assign({}, event, { softDeleted: false });
		this.solutionService.update({ id: event._id, entity: event })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onSoftDelete(event: any) {
		const entity = assign({}, event, { softDeleted: true });
		this.solutionService.update({ id: event._id, entity: event })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onDelete(event: any) {
		this.solutionService.delete({ id: event._id })
			.subscribe(
				(res) => res,
				(err) => err
			);
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

					const updatedObjectWithNewVoteData = assign({}, item, {
						votes: {
							...item.votes,
							currentUser: {
								...item.votes.currentUser,
								voteValue: res.voteValue
							}
						}
					});


					if (model === 'Solution') {
						this.voteQuery.selectEntity(item._id)
							.subscribe((
								(data) => {
								}
							))
					
					}

					if (model === 'Proposal') {
						this.proposalService.updateProposalVote(updatedObjectWithNewVoteData);
					}

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

	handleSuggestionSubmit(formData: any) {
		const suggestion = <Suggestion>formData;
		suggestion.organizations = this.organization;

		this.suggestionService.create({ entity: suggestion })
			.subscribe(
				t => {
					this.openSnackBar('Succesfully created', 'OK');
				},
				(error) => {
					this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
				})
	}


	onSuggestionDelete(event: any) {
		this.suggestionService.delete({ id: event._id })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onSuggestionSoftDelete(event: any) {
		const entity = assign({}, event, { softDeleted: true });
		this.suggestionService.update({ id: event._id, entity })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onSuggestionRestore(event: any) {
		const entity = assign({}, event, { softDeleted: false });
		this.suggestionService.update({ id: event._id, entity })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}


	onSuggestionVote(voteData: any) {
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
				const updatedSuggestionWithNewVoteData = assign({}, item, {
					votes: {
						...item.votes,
						currentUser: {
							...item.votes.currentUser,
							voteValue: res.voteValue
						}
					}
				});

				this.suggestionService.updateSuggestionVote(updatedSuggestionWithNewVoteData);
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
}
