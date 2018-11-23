import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';

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
		color: 'accent',
		routerLink: '/topics/create'
	}];

	constructor(private topicService: TopicService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
	}

	fetchData(force?: boolean) {
		this.isLoading = true;
		this.topicService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(topics => { this.topics = topics; });
	}

	onDelete(event: any) {
		this.topicService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

}
