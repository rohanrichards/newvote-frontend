import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take, tap } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
import { MatSnackBar } from '@angular/material'
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Solution, ISolution } from '@app/core/models/solution.model'
import { Vote } from '@app/core/models/vote.model'
import { ProposalService } from '@app/core/http/proposal/proposal.service'

import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { OrganizationService } from '@app/core'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { Observable } from 'rxjs'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { IProposal } from '@app/core/models/proposal.model'

@Component({
    selector: 'app-solution',
    templateUrl: './solution-view.component.html',
    styleUrls: ['./solution-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class SolutionViewComponent implements OnInit {

    solution: ISolution;
    isLoading: boolean;
    loadingState: string;
    handleImageUrl = optimizeImage;
    organization: any;
    suggestions: any[];
    proposals: any[];
    proposals$: Observable<IProposal[]>
    suggestions$: Observable<any[]>
    isVerified: boolean

    constructor(
        private organizationService: OrganizationService,
        private suggestionService: SuggestionService,
        private stateService: StateService,
        private solutionService: SolutionService,
        private voteService: VoteService,
        private proposalService: ProposalService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private suggestionQuery: SuggestionQuery,
        private solutionQuery: SolutionQuery,
        private voteQuery: VotesQuery,
        public admin: AdminService,
        private proposalQuery: ProposalQuery,
        public authQuery: AuthenticationQuery,
        public repQuery: RepQuery,
        private access: AccessControlQuery,
        private entityVotes: EntityVotesQuery
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.getSolution(ID)
            this.getProposals()
            this.getSuggestions()
            this.subscribeToSolutionStore(ID)
        })

        this.access.isCommunityVerified$
            .subscribe((verified: boolean) => {
                this.isVerified = verified
            })

    }

    getSolution(id: string) {
        const isModerator = this.auth.isModerator()
        const options = { showDeleted: isModerator ? true : '' }

        this.solutionService.view({
            id: id,
            params: options
        })
            .subscribe(
                (solution: Solution) => {
                    return solution
                },
                () => this.stateService.setLoadingState(AppState.error)
            )
    }

    getProposals() {
        this.proposalService.list({})
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    getSuggestions() {
        const isModerator = this.auth.isModerator()

        this.suggestionService.list({
            params: {
                showDeleted: isModerator ? true : ''
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    subscribeToSolutionStore(id: string) {
        this.entityVotes.getSolution(id)
            .subscribe((solution: ISolution) => {
                if (!solution) return false
                this.solution = solution
                this.subscribeToProposalStore(solution._id)
                this.subscribeToSuggestionStore(solution._id)
                this.stateService.setLoadingState(AppState.complete)
                this.updateTags(solution)
            })
    }

    updateTags(solution: ISolution) {
        // meta url tags do not recognize relative paths like 'assets/solution.png'
        // check if the image is from a relative url if so retrieve absolute url
        const imageUrl = solution.imageUrl.includes('assets') ? 
            'https://s3-ap-southeast-2.amazonaws.com/newvote.frontend.staging/assets/solution-icon-min.png'
            : solution.imageUrl
        
        this.meta.updateTags(
            {
                title: solution.title,
                appBarTitle: 'View Solution',
                description: solution.description,
                image: imageUrl
            })
    }

    subscribeToSuggestionStore(id: string) {
        this.suggestions$ = this.entityVotes.getManySuggestions(id, 'parent')

        this.suggestions$.subscribe((res) => {
            if (!res) return false
            this.suggestions = res
        })
    }

    subscribeToProposalStore(id: string) {
        this.proposals$ = this.entityVotes.getManyProposals(id)

        this.proposals$.subscribe((res) => {
            if (!res) return
            this.proposals = res
        })
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
        const { item, voteValue, item: { votes: { currentUser = false } = false } } = voteData
        const vote = new Vote(item._id, model, voteValue)
        const existingVote = item.votes.currentUser

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

    handleSuggestionSubmit(formData: any) {
        const suggestion = formData as Suggestion
        suggestion.organizations = this.organization

        suggestion.parent = this.solution._id
        suggestion.parentType = 'Solution'
        suggestion.parentTitle = this.solution.title

        this.suggestionService.create({ entity: suggestion })
            .subscribe(
                () => {
                    this.admin.openSnackBar('Succesfully created', 'OK')
                },
                (error) => {
                    this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                }
            )
    }

}
