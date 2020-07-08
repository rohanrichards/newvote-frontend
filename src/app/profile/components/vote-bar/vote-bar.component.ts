import { Component, OnInit, Input } from '@angular/core'

@Component({
    selector: 'app-vote-bar',
    templateUrl: './vote-bar.component.html',
    styleUrls: ['./vote-bar.component.scss'],
})
export class VoteBarComponent implements OnInit {
    @Input() totalVotes: any

    constructor() {}

    ngOnInit() {}

    votedFor() {
        const { votes: userVotes = 0, entities = 0 } = this.totalVotes

        if (!this.totalVotes) {
            return 0
        }

        return Math.round((userVotes / entities) * 100)
    }

    votedAgainst() {
        const { votes: userVotes = 0, entities = 0 } = this.totalVotes

        if (!this.totalVotes) {
            return 0
        }

        return Math.round(((entities - userVotes) / entities) * 100)
    }
}
