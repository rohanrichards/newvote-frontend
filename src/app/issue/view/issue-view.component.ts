import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
import { MatSnackBar } from '@angular/material'
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { TopicService } from '@app/core/http/topic/topic.service'
import { IssueService } from '@app/core/http/issue/issue.service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { MediaService } from '@app/core/http/media/media.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { IIssue, Issue } from '@app/core/models/issue.model'
import { Solution, ISolution } from '@app/core/models/solution.model'
import { Media } from '@app/core/models/media.model'
import { Vote } from '@app/core/models/vote.model'

import { optimizeImage } from '@app/shared/helpers/cloudinary'

import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { OrganizationService } from '@app/core'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { Observable } from 'rxjs'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { MediaQuery } from '@app/core/http/media/media.query'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { FeedService } from '@app/core/http/feed'
import { Progress } from '@app/core/models/progress.model'
import { ProgressService, ProgressQuery } from '@app/core/http/progress'
import { cloneDeep } from 'lodash'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { NotificationService } from '@app/core/http/notifications/notification.service'
import { INotification } from '@app/core/models/notification.model'

@Component({
    selector: 'app-issue',
    templateUrl: './issue-view.component.html',
    styleUrls: ['./issue-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class IssueViewComponent implements OnInit {

    issue: IIssue;
    solutions: Array<Solution>;
    media: Array<Media>;
    isLoading: boolean;
    voteSnack: any;
    headingEdit = false;
    loadingState: string;
    handleImageUrl = optimizeImage;
    isOpen = false;
    organization: any;
    suggestions: any;
    solutions$: Observable<ISolution[]>;
    suggestions$: Observable<ISuggestion[]>;
    isVerified: boolean;
    progress: any;

    defaultState = {
        _id: '',
        organizations: '',
        parent: '',
        parentType: 'Issue',
        states: [
            {
                name: 'Raised',
                active: true
            },
            {
                name: 'In Progress',
                active: false
            },
            {
                name: 'Outcome',
                active: false
            },
        ]
    } as Progress

    solutionAccordion = false
    suggestionAccordion = false

    constructor(
        private organizationService: OrganizationService,
        private suggestionService: SuggestionService,
        private stateService: StateService,
        private topicService: TopicService,
        private issueService: IssueService,
        private solutionService: SolutionService,
        private mediaService: MediaService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private issueQuery: IssueQuery,
        private proposalService: ProposalService,
        public admin: AdminService,
        private mediaQuery: MediaQuery,
        public repQuery: RepQuery,
        public authQuery: AuthenticationQuery,
        public access: AccessControlQuery,
        private feedService: FeedService,
        private progressQuery: ProgressQuery,
        private progressService: ProgressService,
        private entityVotes: EntityVotesQuery,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.organizationService.get()
            .subscribe(
                (org) => { this.organization = org },
                (err) => err
            )

        this.stateService.loadingState$.subscribe((state) => { this.loadingState = state })
        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.fetchData(ID)
            this.subscribeToIssueStore(ID)
        })

        this.access.isCommunityVerified$
            .subscribe((verified: boolean) => {
                this.isVerified = verified
            })

        this.getSuggestions()
    }

    subscribeToSuggestionStore(id: string) {
        this.suggestions$ = this.entityVotes.getManySuggestions(id, 'parent')

        this.suggestions$.subscribe((res) => {
            if (!res.length) {
                this.suggestionAccordion = false
                return false
            }
            this.suggestions = res
            this.suggestionAccordion = true
        })
    }

    subscribeToProgressStore(parentId: string) {
        this.progressQuery.selectAll({
            filterBy: (entity) => entity.parent === parentId
        })
            .subscribe((res) => {
                if (!res.length) {
                    this.progress = this.defaultState
                    return false
                }
                this.progress = res[0]
            })
    }

    subscribeToIssueStore(id: string) {

        this.issueQuery.getIssueWithTopic(id)
            .subscribe(
                (issue: Issue) => {
                    if (!issue) return issue

                    this.issue = issue
                    this.subscribeToSuggestionStore(issue._id)
                    this.subscribeToSolutionStore(issue._id)
                    this.subscribeToMediaStore(issue._id)
                    this.subscribeToProgressStore(issue._id)
                    this.getMedia(issue._id)
                    this.stateService.setLoadingState(AppState.complete)
                },
                (err) => err)
    }

    subscribeToSolutionStore(issueId: string) {
        this.solutions$ = this.entityVotes.getManySolutions(issueId)

        this.solutions$.subscribe((items: ISolution[]) => {
            if (!items.length) {
                this.solutionAccordion = false
                return false
            }
            this.solutionAccordion = true
        })
    }

    subscribeToMediaStore(id: string) {
        this.mediaQuery.selectIssueMedia(id)
            .subscribe((media: Media[]) => {
                this.media = media
            })
    }

    fetchData(id: string) {
        this.getIssue(id)
        this.getProposals()
        this.getSolutions()
        this.getSuggestions()
        this.getTopics()
        this.getProgress()
    }

    getTopics() {
        const isOwner = this.auth.isOwner()
        const params = {
            showDeleted: isOwner ? true : ''
        }

        this.topicService.list({ orgs: [], params })
            .subscribe(
                res => res,
                err => err
            )
    }

    getProgress() {
        this.progressService.get({})
            .subscribe((res) => res)
    }

    getSuggestions() {
        const isOwner = this.auth.isOwner()

        this.suggestionService.list({
            forceUpdate: true,
            params: {
                showDeleted: isOwner ? true : ''
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    getIssue(id: string) {
        return this.issueService.view({ id: id, orgs: [] })
            .subscribe(
                (issue) => {
                    const imageUrl = issue.imageUrl.includes('assets') ?
                        'https://s3-ap-southeast-2.amazonaws.com/newvote.frontend.staging/assets/issue-icon-min.png'
                        : issue.imageUrl

                    this.meta.updateTags(
                        {
                            title: issue.name || '',
                            appBarTitle: 'View Issue',
                            description: issue.description || '',
                            image: imageUrl
                        })
                },
                () => {
                    this.isLoading = false
                    this.stateService.setLoadingState(AppState.error)
                }
            )
    }

    getSolutions() {
        const isOwner = this.auth.isOwner()
        const params = { showDeleted: isOwner ? true : '' }

        return this.solutionService.list({
            params
        })
            .subscribe(
                (res: any) => res,
                (err) => err
            )
    }

    getProposals() {
        const isOwner = this.auth.isOwner()
        const params = { showDeleted: isOwner ? true : '' }
        return this.proposalService.list({
            params
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    getMedia(id: string) {
        const isOwner = this.auth.isOwner()

        this.mediaService.list({
            params: { issueId: id, showDeleted: isOwner ? true : '' }
        })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    onVote(voteData: any, model: string) {

        this.isLoading = true
        const { item, voteValue, item: { votes: { currentUser = false } = false } } = voteData
        let vote = new Vote(item._id, model, voteValue)

        if (currentUser) {
            vote = Object.assign({}, currentUser, {
                voteValue: voteValue === currentUser.voteValue ? 0 : voteValue
            })
        }

        this.voteService.create({ entity: vote })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => {
                    this.admin.openSnackBar('Your vote was recorded', 'OK')
                },
                (error) => {
                    if (error) {
                        if (error.status === 401) this.admin.openSnackBar('You must be logged in to vote', 'OK')
                        this.admin.openSnackBar('There was an error recording your vote', 'OK')
                    }
                }
            )
    }

    toggleHeader() {
        this.headingEdit = !this.headingEdit
    }

    handleSubmit(value?: string) {

        this.toggleHeader()
        if (!value) {
            return
        }

        this.issue.mediaHeading = value
        this.issueService.update({ id: this.issue._id, entity: this.issue })
            .subscribe((t) => {
                this.issue = t
            })
    }

    toggleContent() {
        this.isOpen = !this.isOpen
    }

    handleSuggestionSubmit(formData: any) {
        const suggestion = formData as Suggestion
        suggestion.organizations = this.organization

        suggestion.parent = this.issue._id
        suggestion.parentType = 'Issue'
        suggestion.parentTitle = this.issue.name

        this.suggestionService.create({ entity: suggestion })
            .subscribe(
                () => this.admin.openSnackBar('Succesfully created', 'OK'),
                (error) => {
                    this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                }
            )
    }

    updateProgress(state: any) {

        if (!this.progress._id) {
            this.progress.parent = this.issue._id
            this.updateState(this.progress, state)
            return this.progressService.create({ entity: this.progress })
                .subscribe(
                    (res) => res,
                    (err) => err
                )
        }
        const updatedProgress = cloneDeep(this.progress)
        this.updateState(updatedProgress, state)
        return this.progressService.update({ id: this.progress._id, entity: updatedProgress })
            .subscribe((res) => res)
    }

    addNotification(description: any) {
        const notification = {
            parent: this.issue._id,
            parentType: 'Issue',
            imageUrl: '',
            description,
            organizations: this.organization._id,
            user: this.authQuery.getValue()._id
        } as INotification
        return this.notificationService.create({ entity: notification })
    }

    updateState(progressState: any, newState: any) {
        // Map over the state object and set all states before the index of the updated state
        const states = progressState.states.slice()
        const stateIndex = states.findIndex((item: any) => {
            return item.name === newState.name
        })

        progressState.states.map((state: any, index: any) => {
            if (index <= stateIndex) {
                state.active = true
                return state
            }
            state.active = false
            return state
        })
    }

}
