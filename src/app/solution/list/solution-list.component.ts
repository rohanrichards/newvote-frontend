import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { differenceWith as _differenceWith } from 'lodash';
import { isEqual as _isEqual } from 'lodash';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

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
		public snackBar: MatSnackBar,
		private meta: MetaService
	) { }

	ngOnInit() {
	this.meta.updateTags(
		{
			title: 'All Solutions',
			description: 'Solutions are the decisions that you think your community should make.'
		});
		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
	}

	fetchData(force?: boolean) {
		this.isLoading = true;
		const isOwner = this.auth.isOwner();

		this.solutionService.list({
			orgs: [],
			forceUpdate: force,
			params: isOwner ? { 'showDeleted': true } :  {}
		})
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(solutions => {
				console.log(solutions, 'this is solution');
				this.solutions = solutions.sort((a: Solution, b: Solution) => b.votes.up - a.votes.up);
			});
	}

	// find the different solution and only update it, not entire list
	// this stops content flashing and unwanted scrolling
	refreshData() {
		const isOwner = this.auth.isOwner();

		this.isLoading = true;
		this.solutionService.list({
			orgs: [],
			forceUpdate: true,
			params: isOwner ? { 'showDeleted': true } :  {} })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(solutions => {
				const diff = _differenceWith(solutions, this.solutions, _isEqual);
				if (diff.length > 0) {
					const index = this.solutions.findIndex(s => s._id === diff[0]._id);
					this.solutions[index] = diff[0];
				}
			});
	}

	onRestore(event: any) {
		this.isLoading = true;
		event.softDeleted = false;

		this.solutionService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
			});
	}

	onSoftDelete(event: any) {
		this.isLoading = true;
		event.softDeleted = true;

		this.solutionService.update({ id: event._id, entity: event })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				this.fetchData(true);
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
				if (res.error.status === 401) {
					this.openSnackBar('You must be logged in to vote', 'OK');
				} else {
					this.openSnackBar('There was an error recording your vote', 'OK');
				}
			} else {
				this.openSnackBar('Your vote was recorded', 'OK');
				this.refreshData();
			}
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

}
