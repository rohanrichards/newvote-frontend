import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { MetaService } from '@app/core/meta.service';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { assign } from 'lodash';
import { TopicQuery } from '@app/core/http/topic/topic.query';
import { Topic } from '@app/core/models/topic.model';
import { AdminService } from '@app/core/http/admin/admin.service';

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
        private topicQuery: TopicQuery,
        public admin: AdminService
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state;
        });

        this.subscribeToTopicStore();
        this.stateService.setLoadingState(AppState.loading);
        this.meta.updateTags(
            {
                title: 'All Topics',
                description: 'List all topics.'
            });

        this.fetchData();
    }

    fetchData() {
        const isModerator = this.auth.isModerator();
        const params = {
            'showDeleted': isModerator ? true : ''
        }

        this.stateService.setLoadingState(AppState.loading);
        this.topicService.list({ orgs: [], params })
            .subscribe(
                topics => this.stateService.setLoadingState(AppState.complete),
                err => this.stateService.setLoadingState(AppState.serverError)
            );
    }

    subscribeToTopicStore() {
        this.topicQuery.selectAll()
            .subscribe((topics: Topic[]) => this.topics = topics)
    }
}
