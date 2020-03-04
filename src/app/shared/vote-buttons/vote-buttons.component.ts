import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { MatSnackBar } from '@angular/material'
import { VotesQuery } from '@app/core/http/vote/vote.query'
import { Observable } from 'rxjs'
import { VoteMetaData } from '@app/core/http/vote/vote.store'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { IVote } from '@app/core/models/vote.model'
import { AdminService } from '@app/core/http/admin/admin.service'

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

    constructor(
        public snackBar: MatSnackBar,
        private votesQuery: VotesQuery,
        public auth: AuthenticationQuery,
        private admin: AdminService
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

    getVoteMetaData() {
        return this.votesQuery.selectEntity(this.item._id)
    }

    upVotesAsPercent() {
        return this.getPercentage(this.item.votes) || 0
    }

    downVotesAsPercent() {
        return 100 - this.getPercentage(this.item.votes) || 0
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
        this.admin.openSnackBar('You have to vote to reveal the result', 'OK')
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
        const { up, down } = this.item.votes
        const totalVotes = up + down

        if (!(this.item.votes.currentUser && this.item.votes.currentUser.voteValue)) {
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
        // If a user votes logs off and logs in on another account they will still be able to see votes
        // if (!this.item.currentUser || !this.auth.credentials || !this.auth.credentials.user) {
        //     return false;
        // }

        return this.item.votes.currentUser && this.item.votes.currentUser.voteValue
    }
}
