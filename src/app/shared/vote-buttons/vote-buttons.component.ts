import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { MatSnackBar } from '@angular/material';

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
		private auth: AuthenticationService,
		public snackBar: MatSnackBar,
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
	}

	upVotesAsPercent() {
		return this.getPercentage(this.item);
	}

	downVotesAsPercent() {
		return 100 - this.getPercentage(this.item);
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
		const { up, down} = this.item.votes;
		const totalVotes = up + down;

		const percentageOfUpVotes = (up / totalVotes) * 100;
		console.log(percentageOfUpVotes, 'this is upvotes');
		return percentageOfUpVotes;
	}

	votesWidthAgainst() {
		const { up, down} = this.item.votes;
		const totalVotes = up + down;

		const percentageOfDownVotes = (down / totalVotes) * 100;
		console.log(percentageOfDownVotes, 'this is downvotes');
		return percentageOfDownVotes;
	}
}
