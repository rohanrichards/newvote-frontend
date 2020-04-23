import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { TopicService } from '@app/core/http/topic/topic.service'
import { MetaService } from '@app/core/meta.service'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { TopicQuery } from '@app/core/http/topic/topic.query'
import { Topic } from '@app/core/models/topic.model'
import { AdminService } from '@app/core/http/admin/admin.service'
import { OrganizationService } from '@app/core'
import { forkJoin } from 'rxjs'

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
    headerText = 'Topics arrange the current issues into broader categories.' +
        'Select a topic below to learn more about it and explore relevant issues being discussed.';

    headerButtons = [{
        text: 'New Topic',
        color: 'warn',
        routerLink: 'create',
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
        public admin: AdminService,
        private organizationService: OrganizationService
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })
        this.stateService.setLoadingState(AppState.loading)

        this.route.params.subscribe(
            (res) => {
                const { id } = res
                this.fetchData(id)
            }
        )

        this.subscribeToTopicStore()
        this.stateService.setLoadingState(AppState.loading)
        this.meta.updateTags(
            {
                title: 'All Topics',
                description: 'List all topics.'
            })
    }

    fetchData(organization: string) {
        const isModerator = this.auth.isModerator()
        const params = {
            showDeleted: isModerator ? true : ''
        }

        const getOrganization = this.organizationService.view({ id: organization, params })
        const getTopics = this.topicService.list({ orgs: [organization], params })

        forkJoin({
            organization: getOrganization,
            topics: getTopics
        })
            .subscribe(
                (res: any) => this.stateService.setLoadingState(AppState.complete),
                () => this.stateService.setLoadingState(AppState.error)
            )
    }

    subscribeToTopicStore() {
        this.topicQuery.selectAll()
            .subscribe((topics: Topic[]) => { 
                if (!topics.length) return false
                this.topics = topics
            })
    }
}
