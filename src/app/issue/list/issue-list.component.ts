import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize, startWith, map } from 'rxjs/operators';
import { zip } from 'rxjs/observable/zip';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';

import { Issue } from '@app/core/models/issue.model';
import { Topic } from '@app/core/models/topic.model';
import { Organization } from '@app/core/models/organization.model';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-list.component.html',
	styleUrls: ['./issue-list.component.scss']
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
	headerText = 'An issue is any problem that needs to be addressed. \
	Select an issue below to learn more about it';
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
	}];

	topicFilter = new FormControl('');
	topicParam: string; // filtered topics can be preselected via url param

	constructor(
		private issueService: IssueService,
		private topicService: TopicService,
		private organizationService: OrganizationService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router
	) {
		this.filteredTopics = this.topicFilter.valueChanges.pipe(
			startWith(''),
			map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()));
	}

	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.topicParam = params.get('topic');
			this.fetchData(force);
		});
	}

	fetchData(force?: boolean) {
		this.isLoading = true;

		const issueObs: Observable<Issue[]> = this.issueService.list({ orgs: [], forceUpdate: force });
		// .subscribe(issues => { this.issues = issues; });

		const topicObs = this.topicService.list({ forceUpdate: force });
		// .subscribe(topics => { this.topics = topics; });

		const orgObs = this.organizationService.get();
		// .subscribe(org => { this.organization = org; });

		const obsCollection = zip(issueObs, topicObs, orgObs);

		obsCollection.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(result => {
				this.issues = result[0];
				this.allTopics = result[1];
				this.organization = result[2];

				console.log(this.topicParam);
				if (this.topicParam) {
					const topic = this._filter(this.topicParam);
					if (topic.length) {
						this.selectedTopics.push(topic[0]);
					}
				}
			});
	}

	// filter the issue list for matching topicId's
	getIssues(topicId: string) {
		const issues = this.issues.filter(issue => {
			return issue.topics.some(topic => topic._id === topicId);
		});
		return issues;
	}

	onDelete(event: any) {
		this.issueService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
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
