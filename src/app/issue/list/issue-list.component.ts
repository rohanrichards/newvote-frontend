import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { MatAutocomplete } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'

import { finalize, startWith, map } from 'rxjs/operators'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { IssueService } from '@app/core/http/issue/issue.service'
import { TopicService } from '@app/core/http/topic/topic.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'

import { Issue } from '@app/core/models/issue.model'
import { Topic } from '@app/core/models/topic.model'
import { Organization } from '@app/core/models/organization.model'
import { MetaService } from '@app/core/meta.service'

import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'

import { AppState } from '@app/core/models/state.model'
import { StateService } from '@app/core/http/state/state.service'
import { JoyRideSteps } from '@app/shared/helpers/joyrideSteps'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { VoteService } from '@app/core/http/vote/vote.service'
import { Vote } from '@app/core/models/vote.model'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { TopicQuery } from '@app/core/http/topic/topic.query'

import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { AllEntityQuery } from '@app/core/http/mediators/entity.query'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { DataFetchService } from '@app/core/http/data/data-fetch.service'

@Component({
    selector: 'app-issue',
    templateUrl: './issue-list.component.html',
    styleUrls: ['./issue-list.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class IssueListComponent implements OnInit {
    @ViewChild('topicInput', { static: false }) topicInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

    issues: Array<Issue> = [];
    allTopics: Array<Topic> = []
    filteredTopics: Observable<Topic[]>;
    selectedTopics: Array<Topic> = [];
    organization: Organization;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading: boolean;
    headerTitle = '';
    headerText = 'Issues can be any problem in your community that you think needs to be addressed.';
    headerButtons = [
        {
            text: 'New Topic',
            color: 'warn',
            routerLink: '/topics/create',
            role: 'admin'
        },
        {
            text: 'View Topics',
            color: 'warn',
            routerLink: '/topics',
            role: 'admin'
        },
        {
            text: 'New Issue',
            color: 'warn',
            routerLink: '/issues/create',
            role: 'rep'
        }];

    stepsArray = [...JoyRideSteps];

    topicFilter = new FormControl('');
    topicParam: string; // filtered topics can be preselected via url param

    loadingState: string;
    suggestions: any[];
    suggestions$: Observable<ISuggestion[]>;
    orphanedIssues: any[] = [];
    isVerified: boolean;
    isOpen: boolean;

    constructor(
        private suggestionQuery: SuggestionQuery,
        private issueQuery: IssueQuery,
        private voteService: VoteService,
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
        private voteQuery: VotesQuery,
        public admin: AdminService,
        public entities: AllEntityQuery,
        public access: AccessControlQuery,
        private entityVotes: EntityVotesQuery,
        private data: DataFetchService
    ) {

    }

    ngOnInit() {

        this.subscribeToSuggestionStore()
        this.subscribeToTopicStore()

        this.access.isCommunityVerified$
            .subscribe((verified: any) => {
                this.isVerified = verified
            })

        this.filteredTopics = this.topicFilter.valueChanges.pipe(
            startWith(''),
            map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()))
    
        this.organizationService.get()
            .subscribe((org) => {
                this.organization = org
            })

        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            this.topicParam = params.get('topic')
        })

        this.meta.updateTags(
            {
                title: 'All Issues',
                description: 'Issues can be any problem or topic in your community that you think needs to be addressed.'
            })

        this.fetchData()
        this.stateService.setLoadingState(AppState.complete)
    }

    fetchData() {
        this.data.getIssues()
    }

    subscribeToSuggestionStore() {
        this.suggestions$ = this.entityVotes.getManySuggestions('issue', 'type')

        this.suggestions$.subscribe(
            (res: any[]) => {
                if (!res.length) {
                    this.isOpen = false
                }
                this.suggestions = res
                this.isOpen = true
            },
            (err) => err
        )
    }

    subscribeToTopicStore() {
        this.entities.populateTopics()
            .subscribe(({ topics, orphanedIssues }: any) => {
                if (!topics || !topics.length) return false
                this.allTopics = topics
                this.orphanedIssues = orphanedIssues || []
            })
    }

    topicSelected(event: any) {
        const selectedItem = event.option.value

        if (!this.selectedTopics.some(topic => topic._id === selectedItem._id)) {
            this.selectedTopics.push(event.option.value)
            this.topicFilter.setValue('')
            this.topicInput.nativeElement.value = ''
        } else {
            this.topicFilter.setValue('')
            this.topicInput.nativeElement.value = ''
        }
    }

    topicRemoved(topic: any) {
        const index = this.selectedTopics.indexOf(topic)

        if (index >= 0) {
            this.selectedTopics.splice(index, 1)
        }
    }

    handleSuggestionSubmit(formData: any) {
        const suggestion = formData as Suggestion
        suggestion.organizations = this.organization

        this.suggestionService.create({ entity: suggestion })
            .subscribe(() => {
                this.admin.openSnackBar('Succesfully created', 'OK')
            },
            (error) => {
                this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            })
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
        // when a new entity is dynamically added, the votes section returns as null.
        // Assign votes & currentUser to false as safe default values to prevent errors
        const { item, voteValue, item: { votes: { currentUser = false } = false } } = voteData
        const vote = new Vote(item._id, model, voteValue)
        if (currentUser) {
            vote.voteValue = currentUser.voteValue === voteValue ? 0 : voteValue
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => {
                    this.admin.openSnackBar('Your vote was recorded', 'OK')
                },
                (error) => {
                    if (error.status === 401) {
                        this.admin.openSnackBar('You must be logged in to vote', 'OK')
                    } else {
                        this.admin.openSnackBar('There was an error recording your vote', 'OK')
                    }
                }
            )
    }

    private _filter(value: any): Topic[] {
        const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase()

        const filterVal = this.allTopics.filter(topic => {
            const name = topic.name.toLowerCase()
            const compare = name.indexOf(filterValue) !== -1
            return compare
        })
        return filterVal
    }

    trackByFn(index: any, item: any) {
        return index || item.id // or item.id
    }
}
