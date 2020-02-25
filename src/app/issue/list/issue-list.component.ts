import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable, forkJoin } from 'rxjs'

import { finalize, startWith, map, take } from 'rxjs/operators'

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
import { Suggestion } from '@app/core/models/suggestion.model'
import { VoteService } from '@app/core/http/vote/vote.service'
import { Vote } from '@app/core/models/vote.model'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { TopicQuery } from '@app/core/http/topic/topic.query'

import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { AllEntityQuery } from '@app/core/http/mediators/entity.query'

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

    issues: Array<Issue>;
    allTopics: Array<Topic>;
    filteredTopics: Observable<Topic[]>;
    selectedTopics: Array<Topic> = [];
    organization: Organization;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading: boolean;
    headerTitle = '';
    headerText = 'Issues can be any problem in your community that you think needs to be addressed.';
    headerButtons = [{
        text: 'New Issue',
        color: 'warn',
        routerLink: '/issues/create',
        role: 'rep'
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
    },
    {
        text: 'Make Suggestion',
        color: 'warn',
        routerLink: '/suggestions/create',
        role: 'user',
        params: { type: 'issue' }
    }];

    stepsArray = [...JoyRideSteps];

    topicFilter = new FormControl('');
    topicParam: string; // filtered topics can be preselected via url param

    loadingState: string;
    suggestions: any[];
    suggestions$: Observable<Suggestion[]>;
    orphanedIssues: any[];

    constructor(
        private suggestionQuery: SuggestionQuery,
        private issueQuery: IssueQuery,
        private voteService: VoteService,
        public snackBar: MatSnackBar,
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
        public entities: AllEntityQuery
    ) {
        this.subscribeToSuggestionStore()
        this.subscribeToTopicStore()

        this.filteredTopics = this.topicFilter.valueChanges.pipe(
            startWith(''),
            map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()))
    }

    ngOnInit() {

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
    }

    fetchData() {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : '' }

        const issueObs: Observable<any[]> = this.issueService.list({ params })
        const topicObs: Observable<any[]> = this.topicService.list({ params })
        const suggestionObs: Observable<any[]> = this.suggestionService.list({ params })

        forkJoin({
            issues: issueObs,
            topics: topicObs,
            suggestions: suggestionObs
        })
            .subscribe(
                () => {
                    if (this.topicParam) {
                        const topic = this._filter(this.topicParam)
                        if (topic.length) {
                            this.selectedTopics.push(topic[0])
                        }
                    }

                    this.stateService.setLoadingState(AppState.complete)
                },
                () => {
                    return this.stateService.setLoadingState(AppState.error)
                }
            )
    }

    subscribeToSuggestionStore() {
        this.suggestions$ = this.suggestionQuery.suggestions$
            .pipe(
                map((suggestions) => {
                    return suggestions.filter((suggestion) => suggestion.type === 'issue')
                }),
            )
    }

    subscribeToTopicStore() {
        // this.topicQuery.selectAll()
        //     .subscribe((topics: Topic[]) => {
        //         this.allTopics = topics
        //     })
        this.entities.populateTopics()
            .subscribe(({topics, orphanedIssues}: any) => {
                if (!topics.length) this.allTopics = []
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
                this.openSnackBar('Succesfully created', 'OK')
            },
            (error) => {
                this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            })
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        })
    }

    onVote(voteData: any, model: string) {

        this.isLoading = true
        const { item, voteValue } = voteData
        const vote = new Vote(item._id, model, voteValue)
        const existingVote = item.votes.currentUser

        if (existingVote) {
            vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => {
                    this.updateEntityVoteData(item, model, res.voteValue)
                    this.openSnackBar('Your vote was recorded', 'OK')
                },
                (error) => {
                    if (error.status === 401) {
                        this.openSnackBar('You must be logged in to vote', 'OK')
                    } else {
                        this.openSnackBar('There was an error recording your vote', 'OK')
                    }
                }
            )
    }

    updateEntityVoteData(entity: any, model: string, voteValue: number) {
        this.voteQuery.selectEntity(entity._id)
            .pipe(
                take(1)
            )
            .subscribe(
                (voteObj) => {
                    // Create a new entity object with updated vote values from
                    // vote object on store + voteValue from recent vote
                    const updatedEntity = {
                        votes: {
                            ...voteObj,
                            currentUser: {
                                voteValue: voteValue === 0 ? false : voteValue
                            }
                        }
                    }

                    if (model === 'Suggestion') {
                        return this.suggestionService.updateSuggestionVote(entity._id, updatedEntity)
                    }
                },
                (err) => err
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
