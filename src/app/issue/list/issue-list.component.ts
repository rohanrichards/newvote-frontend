import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';

import { finalize, startWith, map, catchError } from 'rxjs/operators';
// import { zip } from 'rxjs/observable/zip';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService, IssueContext } from '@app/core/http/issue/issue.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';

import { Issue } from '@app/core/models/issue.model';
import { Topic } from '@app/core/models/topic.model';
import { Organization } from '@app/core/models/organization.model';
import { MetaService } from '@app/core/meta.service';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';

import { AppState } from '@app/core/models/state.model';
import { StateService } from '@app/core/http/state/state.service';
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { Suggestion } from '@app/core/models/suggestion.model';
import { VoteService } from '@app/core/http/vote/vote.service';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-list.component.html',
	styleUrls: ['./issue-list.component.scss'],
	animations: [
		trigger('fadeIn', fadeIn(':enter'))
	]
})
export class IssueListComponent implements OnInit {
	@ViewChild('topicInput') topicInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	issues: Array<Issue>;
	allTopics: Array<Topic>;
	filteredTopics: Observable<Topic[]>;
	selectedTopics: Array<Topic> = [];
	organization: Organization;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	isLoading: boolean;
	headerTitle = 'Browse By Issue';
	headerText = 'Issues can be any problem or topic in your community that you think needs to be addressed.';
	headerButtons = [{
		text: 'New Issue',
		color: 'warn',
		routerLink: '/issues/create',
		role: 'admin'
	},
	{
		text: 'New Topic',
		color: 'warn',
		routerLink: '/topics/create',
		role: 'admin'
	},
	{
		text: 'All Topics',
		color: 'warn',
		routerLink: '/topics',
		role: 'admin'
	},
	{
		text: 'Make Suggestion',
		color: 'warn',
		routerLink: '/suggestions/create',
		role: 'user',
		params: { type: 'issue' }
	}];

	stepsArray = [...JoyRideSteps];

	topicFilter = new FormControl('');
	topicParam: string; // filtered topics can be preselected via url param

	loadingState: string;
	suggestions: any[];

	constructor(
		private voteService: VoteService,
		public snackBar: MatSnackBar,
		private suggestionService: SuggestionService,
		public stateService: StateService,
		private issueService: IssueService,
		private topicService: TopicService,
		private organizationService: OrganizationService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		private meta: MetaService
	) {
		this.filteredTopics = this.topicFilter.valueChanges.pipe(
			startWith(''),
			map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()));
	}

	ngOnInit() {
		this.organizationService.get()
			.subscribe((org) => {
				this.organization = org;
			});

		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.stateService.setLoadingState(AppState.loading);
		this.route.paramMap.subscribe(params => {
			this.topicParam = params.get('topic');
		});
		this.route.queryParamMap.subscribe(queryParams => {
			const force: boolean = !!queryParams.get('forceUpdate');
			this.fetchData(force);
		});

		this.meta.updateTags(
			{
				title: 'All Issues',
				description: 'Issues can be any problem or topic in your community that you think needs to be addressed.'
			});

	}



	fetchData(force?: boolean) {
		this.setAppState(AppState.loading);
		const isOwner = this.auth.isOwner();

		const options = {
			orgs: [],
			forceUpdate: force,
			params: isOwner ? { 'showDeleted': true } : {}
		} as IssueContext;

		const issueObs: Observable<any[]> = this.issueService.list(options);
		const topicObs: Observable<any[]> = this.topicService.list({ forceUpdate: force });
		const suggestionObs: Observable<any[]> = this.suggestionService.list({
			forceUpdate: true,
			params: {
				'showDeleted': isOwner ? true : '',
				'type': 'issue',
			}
		})

		forkJoin({
			issues: issueObs,
			topics: topicObs,
			suggestions: suggestionObs
		})
			.subscribe(
				results => {
					const { issues, topics, suggestions } = results;

					this.issues = issues;
					this.allTopics = topics;
					this.suggestions = suggestions;

					if (this.topicParam) {
						const topic = this._filter(this.topicParam);
						if (topic.length) {
							this.selectedTopics.push(topic[0]);
						}
					}
					return this.stateService.setLoadingState(AppState.complete);
				},
				err => {
					return this.stateService.setLoadingState(AppState.serverError);
				}
			);
	}

	getSuggestions() {
		const isOwner = this.auth.isOwner();

		this.suggestionService.list({
			forceUpdate: true,
			params: {
				'showDeleted': isOwner ? true : '',
				'type': 'issue',
			}
		})
			.subscribe(
				(suggestions) => {
					this.suggestions = suggestions;
				},
				(err) => err
			)
	}



	// filter the issue list for matching topicId's
	getIssues(topicId: string) {
		if (!topicId) {
			return false;
		}
		const issues = this.issues.filter(issue => {
			return issue.topics.some(topic => topic._id === topicId);
		});
		return issues;
	}

	onDelete(event: any) {
		this.issueService.delete({ id: event._id }).subscribe(() => {
			this.fetchData(true);
		});
	}

	onSoftDelete(event: any) {
		event.softDeleted = true;
		this.issueService.update({ id: event._id, entity: event }).subscribe(() => {
			this.fetchData(true);
		});
	}

	onRestore(event: any) {
		event.softDeleted = false;
		this.issueService.update({ id: event._id, entity: event }).subscribe(() => {
			this.fetchData(true);
		});
	}

	onDeleteTopic(topic: any) {
		this.topicService.delete({ id: topic._id }).subscribe(() => {
			this.fetchData(true);
		});
	}

	onSoftDeleteTopic(topic: any) {
		this.isLoading = true;
		topic.softDeleted = true;

		this.topicService.update({ id: topic._id, entity: topic })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
			});
	}

	topicSelected(event: any) {
		const selectedItem = event.option.value;

		if (!this.selectedTopics.some(topic => topic._id === selectedItem._id)) {
			this.selectedTopics.push(event.option.value);
			this.topicFilter.setValue('');
			this.topicInput.nativeElement.value = '';
		} else {
			this.topicFilter.setValue('');
			this.topicInput.nativeElement.value = '';
		}
	}

	topicRemoved(topic: any) {
		const index = this.selectedTopics.indexOf(topic);

		if (index >= 0) {
			this.selectedTopics.splice(index, 1);
		}
	}

	setAppState(state: AppState) {
		return this.loadingState = state;
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

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	onSuggestionDelete(event: any) {
		this.suggestionService.delete({ id: event._id }).subscribe(() => {
			this.getSuggestions()
		});
	}

	onSuggestionSoftDelete(event: any) {
		event.softDeleted = true;
		this.suggestionService.update({ id: event._id, entity: event }).subscribe(() => {
			this.getSuggestions()
		});
	}

	onSuggestionRestore(event: any) {
		event.softDeleted = false;
		this.suggestionService.update({ id: event._id, entity: event }).subscribe(() => {
			this.getSuggestions()
		});
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
				this.openSnackBar('Your vote was recorded', 'OK');
				this.getSuggestions();
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

	private _filter(value: any): Topic[] {
		const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase();

		const filterVal = this.allTopics.filter(topic => {
			const name = topic.name.toLowerCase();
			const compare = name.indexOf(filterValue) !== -1;
			return compare;
		});
		return filterVal;
	}

}
