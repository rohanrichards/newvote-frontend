import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { finalize, take, filter, map } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
import { MatSnackBar } from '@angular/material'
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { VoteService } from '@app/core/http/vote/vote.service'
import { MetaService } from '@app/core/meta.service'

import { Proposal, IProposal } from '@app/core/models/proposal.model'
import { Vote } from '@app/core/models/vote.model'
import { optimizeImage } from '@app/shared/helpers/cloudinary'

import { trigger } from '@angular/animations'
import { fadeIn } from '@app/shared/animations/fade-animations'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { OrganizationService } from '@app/core'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'

import { VotesQuery } from '@app/core/http/vote/vote.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { Observable, pipe, forkJoin } from 'rxjs'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'

@Component({
    selector: 'app-proposal',
    templateUrl: './proposal-view.component.html',
    styleUrls: ['./proposal-view.component.scss'],
    animations: [
        trigger('fadeIn', fadeIn(':enter'))
    ]
})
export class ProposalViewComponent implements OnInit {

    proposal: IProposal;
    proposals: Array<Proposal>;
    isLoading: boolean;
    loadingState: string;
    handleImageUrl = optimizeImage;
    organization: any;
    suggestions: any[];
    suggestions$: Observable<ISuggestion[]>
    isVerified: boolean

    constructor(
        private organizationService: OrganizationService,
        private suggestionService: SuggestionService,
        private stateService: StateService,
        private proposalService: ProposalService,
        private voteService: VoteService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private meta: MetaService,
        private proposalQuery: ProposalQuery,
        private suggestionQuery: SuggestionQuery,
        private voteQuery: VotesQuery,
        public admin: AdminService,
        public authQuery: AuthenticationQuery,
        public repQuery: RepQuery,
        private access: AccessControlQuery,
        private entityVotes: EntityVotesQuery,
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)

        this.route.paramMap.subscribe(params => {
            const organization = params.get('id');
            const ID = params.get('proposalId')
            this.subscribeToProposalStore(ID)
            this.fetchData(ID, organization)
        })

        this.access.isCommunityVerified$
            .subscribe((verified: boolean) => {
                this.isVerified = verified
            })
    }

    fetchData(id: string, organization: string) {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        const getProposal = this.proposalService.view({ id: id, orgs: [organization] })
        const getOrganization = this.organizationService.view({ id: organization, params })
        const getSuggestions = this.suggestionService.list({ orgs: [organization], params })

        forkJoin({
            proposal: getProposal,
            organization: getOrganization,
            suggestions: getSuggestions
        })
            .subscribe(
                (res) => res,
                () => this.stateService.setLoadingState(AppState.error)
            )
    }

    subscribeToSuggestionStore(id: string) {
        this.suggestions$ = this.entityVotes.getManySuggestions(id, 'parent')
    }

    subscribeToProposalStore(id: string) {
        this.entityVotes.getProposal(id)
            .subscribe((proposal: IProposal) => {
                if (!proposal) return false
                this.proposal = proposal
                this.subscribeToSuggestionStore(proposal._id)
                this.updateTags(proposal)
                return this.stateService.setLoadingState(AppState.complete)
            })
    }

    updateTags(proposal: IProposal) {
        // meta url tags do not recognize relative paths like 'assets/solution.png'
        // check if the image is from a relative url if so retrieve absolute url
        const imageUrl = proposal.imageUrl.includes('assets') ? 
            'https://s3-ap-southeast-2.amazonaws.com/newvote.frontend.staging/assets/action-icon-min.png'
            : proposal.imageUrl
        this.meta.updateTags(
            {
                title: `${proposal.title}`,
                appBarTitle: 'View Action',
                description: proposal.description,
                image: imageUrl
            })
    }

    onVote(voteData: any, model: string) {
        this.isLoading = true
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

    handleSuggestionSubmit(formData: any) {
        const suggestion = formData as Suggestion
        suggestion.organizations = this.organization

        suggestion.parent = this.proposal._id
        suggestion.parentType = 'Action'
        suggestion.parentTitle = this.proposal.title

        this.suggestionService.create({ entity: suggestion })
            .subscribe(() => {
                this.admin.openSnackBar('Succesfully created', 'OK')
            },
            (error) => {
                this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            })
    }

}
