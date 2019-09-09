import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';

import { finalize, startWith, map } from 'rxjs/operators';

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
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';
import { assign } from 'lodash';
import { IssueQuery } from '@app/core/http/issue/issue.query';
import { TopicQuery } from '@app/core/http/topic/topic.query';

import { cloneDeep } from 'lodash';

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
		private suggestionQuery: SuggestionQuery,
		private issueQuery: IssueQuery,
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
		private meta: MetaService,
		private topicQuery: TopicQuery,
		private cdR: ChangeDetectorRef
	) {

		this.subscribeToIssueStore();
		this.subscribeToSuggestionStore();
		this.subscribeToTopicStore();

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

		this.fetchData();

		this.route.paramMap.subscribe(params => {
			this.topicParam = params.get('topic');
		});

		this.meta.updateTags(
			{
				title: 'All Issues',
				description: 'Issues can be any problem or topic in your community that you think needs to be addressed.'
			});
	}



	fetchData() {
		const isOwner = this.auth.isOwner();
		const options = {
			params: { 'showDeleted': isOwner ? true : '' }
		}

		const issueObs: Observable<any[]> = this.issueService.list(options);
		const topicObs: Observable<any[]> = this.topicService.list(options);
		const suggestionObs: Observable<any[]> = this.suggestionService.list(options)

		forkJoin({
			issues: issueObs,
			topics: topicObs,
			suggestions: suggestionObs
		})
			.subscribe(
				results => {
					const { issues, topics, suggestions } = results;

					// this.allTopics = topics;

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

	subscribeToSuggestionStore() {

		this.suggestionQuery.selectAll({
			filterBy: entity => entity.type === 'issue'
		})
			.subscribe((suggestions: Suggestion[]) => {
				this.suggestions = suggestions;
			})
	}

	subscribeToTopicStore() {
		this.topicQuery.selectAll()
			.subscribe((topics: Topic[]) => {
				this.allTopics = topics
			});
	}

	subscribeToIssueStore() {
		this.issueQuery.selectAll()
			.subscribe((issues: Issue[]) => {
				this.issues = issues;
			})
	}

	// filter the issue list for matching topicId's
	filterIssues(topic: Topic, issues: Issue[]) {
		const issuesCopy = issues.slice();

		return issuesCopy.filter((issue) => {
			const topicExists = issue.topics.some((ele) => {
				// If a new issue is created the topics array will be populated
				// with objectId's / strings instead of objects with an ._id key
				if (typeof ele === 'string') {
					return ele === topic._id;
				}

				return ele._id === topic._id;
			})

			return topicExists;
		});
	}

	onDelete(event: any) {
		this.issueService.delete({ id: event._id })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onSoftDelete(event: any) {
		const entity = assign({}, event, { softDeleted: true });
		this.issueService.update({ id: event._id, entity })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onRestore(event: any) {
		const entity = assign({}, event, { softDeleted: false });
		this.issueService.update({ id: event._id, entity })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onDeleteTopic(topic: any) {
		this.topicService.delete({ id: topic._id })
			.subscribe(
				(res) => res,
				(err) => err
			);
	}

	onSoftDeleteTopic(topic: any) {
		const entity = assign({}, event, { softDeleted: true });
		this.topicService.update({ id: topic._id, entity: topic })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(
				(res) => res,
				(err) => err
			);
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

	handleSuggestionSubmit(formData: any) {
		const suggestion = <Suggestion>formData;
		suggestion.organizations = this.organization;

		this.suggestionService.create({ entity: suggestion })
			.subscribe(
				t => this.openSnackBar('Succesfully created', 'OK'),
				(error) => this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
			)
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
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
						currentUser: {
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

	private _filter(value: any): Topic[] {
		const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase();

		const filterVal = this.allTopics.filter(topic => {
			const name = topic.name.toLowerCase();
			const compare = name.indexOf(filterValue) !== -1;
			return compare;
		});
		return filterVal;
	}

	trackByFn(index, item) {
		return index; // or item.id
	}
}
