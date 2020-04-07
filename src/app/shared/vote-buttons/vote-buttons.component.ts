import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { VoteMetaData } from '@app/core/http/vote/vote.store'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { IVote } from '@app/core/models/vote.model'
import { AdminService } from '@app/core/http/admin/admin.service'
import { ToastService } from '@app/core/toast/toast.service'
import { VotesQuery } from '@app/core/http/vote/vote.query'

@Component({
    selector: 'app-vote-buttons',
    templateUrl: './vote-buttons.component.html',
    styleUrls: ['./vote-buttons.component.scss']
})
export class VoteButtonsComponent implements OnInit {
    @Input() item: any;
    @Output() vote = new EventEmitter();

    // Radar
    public chartLabels: any = [];
    public data: any = [[(10 / 12) * 100], [(2 / 12) * 100]];
    public chartColors = [
        {
            backgroundColor: '#0277bd',
            pointBorderColor: '#212121',
            borderColor: '#212121',
            hoverBorderColor: '#212121'
        },
        {
            backgroundColor: '#142C45',
            pointBorderColor: '#212121',
            borderColor: '#212121'
        }
    ];

    public dataSetOverride: any;

    defaultValues: VoteMetaData = {
        _id: '',
        up: 0,
        down: 0,
        total: 0,
    }

    constructor(
        public snackBar: MatSnackBar,
        private admin: AdminService,
        public auth: AuthenticationQuery,
        public toast: ToastService,
        private votesQuery: VotesQuery
    ) { }

    ngOnInit() {
        this.dataSetOverride = [
            {
                borderWidth: 0,
                borderSkipped: 'top',
                data: [this.upVotesAsPercent()]
            },
            {
                borderWidth: 0,
                borderSkipped: 'top',
                data: [this.downVotesAsPercent()]
            }
        ]
    }

    upVotesAsPercent() {
        const vote = this.item.votes || this.defaultValues
        return this.getPercentage(vote) || 0
    }

    downVotesAsPercent() {
        const vote = this.item.votes || this.defaultValues
        return 100 - this.getPercentage(vote) || 0
    }

    getPercentage(votes: VoteMetaData) {
        if (votes.total === 0) {
            // no votes yet
            return 0
        }

        const numerator = votes.up
        const denominator = (votes.up + votes.down)

        if (denominator === 0) {
            // stop divide by zero
            return 0
        }

        const perc = Math.round((numerator / denominator) * 100)
        return perc
    }

    onVote(item: any, voteValue: number, event: any) {
        event.stopPropagation()
        this.vote.emit({ item, voteValue })
    }

    voteToRevealMessage(event: any) {
        event.stopPropagation()
        this.toast.openSnackBar('You have to vote to reveal the result', 'OK')
    }

    votesWidthFor() {
        const { up, down } = this.item.votes
        const totalVotes = up + down

        const percentageOfUpVotes = (up / totalVotes) * 100
        return Math.round(percentageOfUpVotes)
    }

    votesWidthAgainst(vote: any) {

        const { up, down } = vote
        const totalVotes = up + down

        const percentageOfDownVotes = (down / totalVotes) * 100
        return Math.round(percentageOfDownVotes) || 0
    }

    totalVotes() {
        const { up, down, currentUser = false } = this.item.votes || this.defaultValues
        const totalVotes = up + down

        if (!(currentUser && currentUser.voteValue)) {
            return ''
        }

        if (totalVotes === 0) {
            return ''
        }

        if (totalVotes === 1) {
            return `${totalVotes} vote`
        }

        return `${totalVotes} votes`
    }

    userHasVoted() {
        const { votes = false, votes: { currentUser = false } = false } = this.item
        // If a user votes logs off and logs in on another account they will still be able to see votes
        // if (!this.item.currentUser || !this.auth.credentials || !this.auth.credentials.user) {
        //     return false;
        // }
        if (!votes || !currentUser) return false
        return !!this.item.votes.currentUser && !!this.item.votes.currentUser.voteValue
    }
}
