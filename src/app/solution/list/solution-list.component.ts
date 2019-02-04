import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { differenceWith as _differenceWith } from 'lodash';
import { isEqual as _isEqual } from 'lodash';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';

import { ISolution, Solution } from '@app/core/models/solution.model';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-solution',
	templateUrl: './solution-list.component.html',
	styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit {

	solutions: Array<any>;
	isLoading: boolean;
	headerTitle = 'Browse By Solution';
	headerText = 'Solutions are the decisions that you think your community should make.';
	headerButtons = [{
		text: 'New Solution',
		color: 'warn',
		routerLink: '/solutions/create',
		role: 'admin'
	}];

	constructor(private solutionService: SolutionService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar
	) { }

	ngOnInit() {
		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
	}

	fetchData(force?: boolean) {
		this.isLoading = true;
		this.solutionService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(solutions => { this.solutions = solutions; });
	}

	// find the different solution and only update it, not entire list
	// this stops content flashing and unwanted scrolling
	refreshData() {
		this.isLoading = true;
		this.solutionService.list({ orgs: [], forceUpdate: true })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(solutions => {
				const diff = _differenceWith(solutions, this.solutions, _isEqual);
				if (diff.length > 0) {
					const index = this.solutions.findIndex(s => s._id === diff[0]._id);
					this.solutions[index] = diff[0];
				}
			});
	}

	onDelete(event: any) {
		this.solutionService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

	onVote(voteData: any, model: string) {
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, model, voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote }).subscribe((res) => {
			if (res.error) {
				this.openSnackBar('There was an error recording your vote', 'OK');
			} else {
				this.openSnackBar('Your vote was recorded', 'OK');
				this.refreshData();
			}
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

}
