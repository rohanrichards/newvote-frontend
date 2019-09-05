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

import { ISolution, Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { FormGroup } from '@angular/forms';
import { Suggestion } from '@app/core/models/suggestion.model';
import { OrganizationService } from '@app/core';
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';
import { forkJoin, Observable } from 'rxjs';

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
		private router: Router,
		public snackBar: MatSnackBar,
		private meta: MetaService,
		private suggestionQuery: SuggestionQuery
	) { }

	ngOnInit() {
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
			this.route.queryParamMap.subscribe(params => {
				const force: boolean = !!params.get('forceUpdate');
				this.fetchData(force);
			});

		this.subscribeToSuggestionStore();
	}

	fetchData(force?: boolean) {
		const isOwner = this.auth.isOwner();
		const options = { 'showDeleted': isOwner ? true : '' }
		
		const solutionObs: Observable<Solution[]> = this.solutionService.list({
			orgs: [],
			forceUpdate: force,
			params: options
		});
		const suggestionObs: Observable<Suggestion[]> = this.suggestionService.list({ params: options})

		forkJoin([
			solutionObs,
			suggestionObs
		])
		.subscribe(
			response => {
				const [solutions, suggestions] = response;
				this.solutions = solutions.sort((a: Solution, b: Solution) => b.votes.up - a.votes.up);
				return 	this.stateService.setLoadingState(AppState.complete);
			},
			err => {
				return this.stateService.setLoadingState(AppState.serverError);
			}
		);
		
	}

	subscribeToSuggestionStore() {
		const isOwner = this.auth.isOwner();

		this.suggestionQuery.selectAll({
			filterBy: entity => entity.type === 'solution'
		})
		.subscribe((suggestions: Suggestion[]) => {
			this.suggestions = suggestions;
		})
	}

	// find the different solution and only update it, not entire list
	// this stops content flashing and unwanted scrolling
	refreshData() {
		const isOwner = this.auth.isOwner();

		this.solutionService.list({
			orgs: [],
			forceUpdate: true,
			params: {
				'showDeleted': isOwner ? true : '',
				'type': 'solution',
			}
		})
			.subscribe(
				solutions => {
					const diff = differenceWith(solutions, this.solutions, isEqual);
					if (diff.length > 0) {
						const index = this.solutions.findIndex(s => s._id === diff[0]._id);
						this.solutions[index] = diff[0];
					}
					return this.stateService.setLoadingState(AppState.complete);
				},
				error => {
					return this.stateService.setLoadingState(AppState.serverError);
				}
			);
	}

	onRestore(event: any) {
		this.isLoading = true;
		event.softDeleted = false;

		this.solutionService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
			});
	}

	onSoftDelete(event: any) {
		this.isLoading = true;
		event.softDeleted = true;

		this.solutionService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
			});
	}

	onDelete(event: any) {
		this.solutionService.delete({ id: event._id }).subscribe(() => {
			this.fetchData(true);
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
			.pipe(finalize(() => this.isLoading = false ))
			.subscribe(
				(res) => {
					this.openSnackBar('Your vote was recorded', 'OK');
					this.refreshData();
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
			.subscribe(t => {
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
			.pipe(finalize(() => this.isLoading = false ))
			.subscribe((res) => {
				const updatedSuggestionWithNewVoteData  = assign({}, item, {
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
