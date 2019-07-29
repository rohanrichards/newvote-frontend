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
	}];


	topicFilter = new FormControl('');
	topicParam: string; // filtered topics can be preselected via url param

	loadingState: string;

	constructor(
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
			params: isOwner ? { 'showDeleted': true } :  {}
		} as IssueContext;

		const issueObs: Observable<any[]> = this.issueService.list(options);
		const topicObs: Observable<any[]> = this.topicService.list({ forceUpdate: force });

		forkJoin({
			issues: issueObs,
			topics: topicObs
		})
		.subscribe(
			results => {
				const { issues, topics } = results;

				this.issues = issues;
				this.allTopics = topics;

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
