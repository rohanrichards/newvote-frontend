import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { TopicService } from '@app/core/http/topic/topic.service';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-list.component.html',
	styleUrls: ['./topic-list.component.scss']
})
export class TopicListComponent implements OnInit {

	topics: Array<any>;
	isLoading: boolean;

	constructor(private topicService: TopicService) { }

	ngOnInit() {
		this.isLoading = true;
		this.topicService.list({ orgs: [] })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(topics => { this.topics = topics; });
	}

}
