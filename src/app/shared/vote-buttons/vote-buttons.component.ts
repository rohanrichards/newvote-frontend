import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AuthenticationService } from '@app/core/authentication/authentication.service';

@Component({
	selector: 'app-vote-buttons',
	templateUrl: './vote-buttons.component.html',
	styleUrls: ['./vote-buttons.component.scss']
})
export class VoteButtonsComponent implements OnInit {

	@Input() item: any;
	@Output() vote = new EventEmitter();

	// Radar
	public chartLabels: string[] = ['For', 'Against'];
	public pieChartType = 'pie';
	public chartColors = [
		{
			backgroundColor: ['rgba(0,255,0,0.8)', 'rgba(255,0,0,0.8)'],
			pointBackgroundColor: ['rgba(0,255,0,0.5)', 'rgba(255,0,0,0.5)'],
			pointHoverBackgroundColor: ['rgba(77,83,96,1)', 'rgba(255,0,0,0.6)'],
			borderColor: ['rgba(77,83,96,1)', 'rgba(255,0,0,0.6)'],
			pointBorderColor: ['#fff', 'rgba(255,0,0,0.6)'],
			pointHoverBorderColor: ['rgba(77,83,96,0.8)', 'rgba(255,0,0,0.6)']
		}
	];
	public chartOptions = {
		elements: {
			arc: {
				borderWidth: 0
			}
		},
		responsive: true,
		legend: {
			display: false
		}
	};


	constructor(private auth: AuthenticationService) { }

	ngOnInit() {
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
}
