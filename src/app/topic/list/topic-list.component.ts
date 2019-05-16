import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { MetaService } from '@app/core/meta.service';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-list.component.html',
	styleUrls: ['./topic-list.component.scss']
})
export class TopicListComponent implements OnInit {

	topics: Array<any>;
	isLoading: boolean;
	headerTitle = 'Browse By Topic';
	headerText = 'Topics arrange the current issues into broader categories. \
		Select a topic below to learn more about it and explore relevant issues being discussed.';
	headerButtons = [{
		text: 'New Topic',
		color: 'warn',
		routerLink: '/topics/create',
		role: 'admin'
	}];

	constructor(private topicService: TopicService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		private meta: MetaService
	) { }

	ngOnInit() {
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
		this.isLoading = true;
		this.topicService.list({ orgs: [], forceUpdate: force, params: { 'showDeleted': true } })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(topics => { this.topics = topics; console.log(this.topics); });
	}

	onRestore(topic: any) {
		this.isLoading = true;
		topic.softDeleted = false;

		this.topicService.update({ id: topic._id, entity: topic })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {	this.fetchData(true); });
	}

	onSoftDelete(topic: any) {
		this.isLoading = true;
		topic.softDeleted = true;

		this.topicService.update({ id: topic._id, entity: topic })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {	this.fetchData(true); });
	}

	onDelete(event: any) {
		this.topicService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

}
