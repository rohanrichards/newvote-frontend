import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { MatSnackBar } from '@angular/material';
import { VotesQuery } from '@app/core/http/vote/vote.query';
import { EntityStateHistoryPlugin } from '@datorama/akita';
import { Observable, of } from 'rxjs';
import { VoteMetaData } from '@app/core/http/vote/vote.store';
import { map, flatMap, tap } from 'rxjs/operators';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY } from '@angular/cdk/overlay/typings/overlay-directives';

@Component({
	selector: 'app-vote-buttons',
	templateUrl: './vote-buttons.component.html',
	styleUrls: ['./vote-buttons.component.scss']
})
export class VoteButtonsComponent implements OnInit {

	voteMetaData$: Observable<VoteMetaData>;
	storeVote: any;

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
		private auth: AuthenticationService,
		public snackBar: MatSnackBar,
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
		];

		// Get the total votes from the akita store
		this.getVoteMetaData()
			.subscribe((vote) => {
				this.storeVote = vote;
			})
	}

	getVoteMetaData() {
		return this.votesQuery.selectEntity(this.item._id);
	}

	upVotesAsPercent() {
		return this.getPercentage(this.item) || 0;
	}

	downVotesAsPercent() {
		return 100 - this.getPercentage(this.item) || 0;
	}

	getPercentage(item: any) {
		if (item.votes.total === 0) {
			// no votes yet
			return 0;
		}

		const numerator = item.votes.up;
		const denominator = (item.votes.up + item.votes.down);

		if (denominator === 0) {
			// stop divide by zero
			return 0;
		}

		const perc = Math.round((numerator / denominator) * 100);
		return perc;
	}

	onVote(item: any, voteValue: number, event: any) {
		event.stopPropagation();
		this.vote.emit({ item, voteValue });
	}

	voteToRevealMessage(event: any) {
		event.stopPropagation();
		this.openSnackBar('You have to vote to reveal the result', 'OK');
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	votesWidthFor() {
		const { up, down } = this.item.votes;
		const totalVotes = up + down;

		const percentageOfUpVotes = (up / totalVotes) * 100;
		return Math.round(percentageOfUpVotes);
	}

	votesWidthAgainst(vote: any) {

		const { up, down } = vote;
		const totalVotes = up + down;

		const percentageOfDownVotes = (down / totalVotes) * 100;
		return Math.round(percentageOfDownVotes) || 0;
	}

	totalVotes() {
		const { up, down } = this.item.votes;
		const totalVotes = up + down;

		if (!(this.item.votes.currentUser && this.item.votes.currentUser.voteValue)) {
			return '';
		}

		if (totalVotes === 0) {
			return '';
		}

		if (totalVotes === 1) {
			return `${totalVotes} vote`;
		}

		return `${totalVotes} votes`;
	}
}
