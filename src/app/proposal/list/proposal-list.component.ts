import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { IProposal, Proposal } from '@app/core/models/proposal.model';
import { Vote } from '@app/core/models/vote.model';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';

@Component({
	selector: 'app-proposal',
	templateUrl: './proposal-list.component.html',
	styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit {

	proposals: Array<any>;
	isLoading: boolean;
	loadingState: string;
	headerTitle = 'Browse By Proposal';
	headerText = 'Proposals arrange the current proposals into broader categories. \
		Select a proposal below to learn more about it and explore relevant proposals being discussed.';
	headerButtons = [{
		text: 'New Proposal',
		color: 'warn',
		routerLink: '/proposals/create',
		role: 'admin'
	}];

	constructor(
		private stateService: StateService,
		private proposalService: ProposalService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		})

		this.stateService.setLoadingState(AppState.loading);

		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
		this.meta.updateTags(
			{
				title: 'All Actions',
				description: 'List all actions.'
			});
	}

	fetchData(force?: boolean) {
		this.isLoading = true;

		this.proposalService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(
				proposals => { 
					this.proposals = proposals;
					this.stateService.setLoadingState(AppState.complete);
				},
				error => this.stateService.setLoadingState(AppState.serverError)
			);
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

		this.voteService.create({ entity: vote })
			.pipe(finalize(() => this.isLoading = false ))
			.subscribe(
				(res) => {
					this.openSnackBar('Your vote was recorded', 'OK');
					this.fetchData(true);
				},
				(error) => {
					if (error.status === 401) {
						this.openSnackBar('You must be logged in to vote', 'OK');
					} else {
						this.openSnackBar('There was an error recording your vote', 'OK');
					}
				}
			);
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	onSoftDelete(event: any) {
		this.isLoading = true;
		event.softDeleted = true;

		this.proposalService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
			});
	}

	onRestore(event: any) {
		this.isLoading = true;
		event.softDeleted = false;

		this.proposalService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
			});
	}

}
