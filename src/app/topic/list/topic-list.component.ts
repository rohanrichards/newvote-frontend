import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { MetaService } from '@app/core/meta.service';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-list.component.html',
	styleUrls: ['./topic-list.component.scss']
})
export class TopicListComponent implements OnInit {

	topics: Array<any>;
	isLoading: boolean;
	loadingState: string;
	headerTitle = 'Browse By Topic';
	headerText = 'Topics arrange the current issues into broader categories. \
		Select a topic below to learn more about it and explore relevant issues being discussed.';
	headerButtons = [{
		text: 'New Topic',
		color: 'warn',
		routerLink: '/topics/create',
		role: 'admin'
	}];

	constructor(
		private stateService: StateService,
		private topicService: TopicService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		private meta: MetaService,
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.stateService.setLoadingState(AppState.loading);

		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
		this.meta.updateTags(
			{
				title: 'All Topics',
				description: 'List all topics.'
			});
	}

	fetchData(force?: boolean) {
		this.stateService.setLoadingState(AppState.loading);
		this.topicService.list({ orgs: [], forceUpdate: force, params: { 'showDeleted': true } })
			.subscribe(
			topics => {
				this.topics = topics;
				return this.stateService.setLoadingState(AppState.complete);
			},
			err => {
				this.stateService.setLoadingState(AppState.serverError);
			}
		);
	}

	onRestore(topic: any) {
		this.isLoading = true;
		topic.softDeleted = false;

		this.topicService.update({ id: topic._id, entity: topic })
			.subscribe(
				(t) => {	this.fetchData(true); },
				(err) => err
			);
	}

	onSoftDelete(topic: any) {
		this.isLoading = true;
		topic.softDeleted = true;

		this.topicService.update({ id: topic._id, entity: topic })
			.subscribe(
				(t) => {	this.fetchData(true); },
				(err) => err
			);
	}

	onDelete(event: any) {
		this.topicService.delete({ id: event._id })
			.subscribe(
				(t) => { this.fetchData(true); },
				(err) => err
			);
	}
}
