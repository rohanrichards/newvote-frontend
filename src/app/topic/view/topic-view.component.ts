import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TopicService } from '../topic.service';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-view.component.html',
	styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent implements OnInit {

	topic: any;
	isLoading: boolean;

	constructor(private topicService: TopicService, private route: ActivatedRoute) { }

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.topicService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(topic => { this.topic = topic; });
		});
	}

}
