import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { VoteService } from '@app/core/http/vote/vote.service';

import { IProposal, Proposal } from '@app/core/models/proposal.model';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-proposal',
	templateUrl: './proposal-list.component.html',
	styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit {

	proposals: Array<any>;
	isLoading: boolean;
	headerTitle = 'Browse By Proposal';
	headerText = 'Proposals arrange the current proposals into broader categories. \
		Select a proposal below to learn more about it and explore relevant proposals being discussed.';
	headerButtons = [{
		text: 'New Proposal',
		color: 'warn',
		routerLink: '/proposals/create',
		role: 'admin'
	}];

	constructor(private proposalService: ProposalService,
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
		this.proposalService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(proposals => { this.proposals = proposals; });
	}

	onDelete(event: any) {
		this.proposalService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

	onVote(voteData: any) {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Proposal', voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote }).subscribe((res) => {
			if (res.error) {
				this.openSnackBar('There was an error recording your vote', 'OK');
			} else {
				this.openSnackBar('Your vote was recorded', 'OK');
				this.fetchData(true);
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
