import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

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
	headerText = 'Solutions arrange the current solutions into broader categories. \
		Select a solution below to learn more about it and explore relevant solutions being discussed.';
	headerButtons = [{
		text: 'New Solution',
		color: 'warn',
		routerLink: '/solutions/create'
	}];

	constructor(private solutionService: SolutionService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit() {
		this.route.paramMap.subscribe(params => {
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

	onDelete(event: any) {
		this.solutionService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

	onVote(voteData: any) {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Solution', voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote }).subscribe(() => {
			this.fetchData(true);
		});
	}

}
