import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { OrganizationService } from '@app/core';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { UserService } from '@app/core/http/user/user.service';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { MetaService } from '@app/core/meta.service';
import { CookieService } from 'ngx-cookie-service';

import { Issue } from '@app/core/models/issue.model';
import { Organization } from '@app/core/models/organization.model';
import { optimizeImage } from '@app/shared/helpers/cloudinary';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { forkJoin } from 'rxjs';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { JoyrideService } from 'ngx-joyride';
import { MatSnackBar } from '@angular/material';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	animations: [
		trigger('fadeIn', fadeIn(':enter'))
	]
})
export class HomeComponent implements OnInit {

	isLoading: boolean;
	org: Organization;
	issues: Issue[];
	solutions: any[];
	proposals: any[];
	userCount: number;
	loadingState: string;
	handleImageUrl = optimizeImage;
	loadTour = true;
	ISSUE_LIMIT = 6;

	constructor(
		private readonly joyrideService: JoyrideService,
		public stateService: StateService,
		public auth: AuthenticationService,
		private organizationService: OrganizationService,
		private issueService: IssueService,
		private solutionService: SolutionService,
		private proposalService: ProposalService,
		private userService: UserService,
		private meta: MetaService,
		private cookieService: CookieService,
		public snackBar: MatSnackBar
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.organizationService.get().subscribe((org) => {
			this.org = org;
			this.meta.updateTags(
				{
					title: 'Home'
				});
		});

		this.fetchData();

		const getSolutions = this.solutionService.list({ forceUpdate: false });
		const getProposals = this.proposalService.list({ forceUpdate: false });
		const getUsers = this.userService.count({ forceUpdate: false });

		forkJoin({
			solutions: getSolutions,
			proposals: getProposals,
			count: getUsers
		})
			.subscribe(
				(results) => {
					const { solutions, proposals, count } = results;

					this.solutions = solutions;
					this.proposals = proposals;
					this.userCount = count;
				},
				(err) => {
					return this.stateService.setLoadingState(AppState.serverError);
				}
			);
	}

	fetchData(force?: boolean) {
		const isOwner = this.auth.isOwner();

		this.isLoading = true;
		this.stateService.setLoadingState(AppState.loading);

		this.issueService.list({
			orgs: [],
			forceUpdate: force,
			// params: isOwner ? { 'showDeleted': true } :  {}
		})
			.subscribe(
				(issues) => {
					this.issues = issues;
					return this.stateService.setLoadingState(AppState.complete);
				},
				(err) => {
					console.log(err, 'this is err');
					return this.stateService.setLoadingState(AppState.serverError);
				}
			);
	}

	onSoftDelete(issue: any) {
		this.isLoading = true;
		issue.softDeleted = true;
		this.issueService.update({ id: issue._id, entity: issue })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => { this.fetchData(true); });
	}

	onDelete(issue: any) {
		this.issueService.delete({ id: issue._id }).subscribe(() => {
			console.log('deleted');
			this.fetchData(true);
		});
	}

	redirect() {
		this.cookieService.set('org', this.org.url, null, '/', '.newvote.org');
		// window.location.href = this.org.authUrl;
		window.open(this.org.authUrl, '_self');
	}

	handleUserCount(count: number) {
		if (!count) {
			return `0`;
		}

		if (count < 1000) {
			return `< 1K`;
		}

		return `${Math.floor(count / 1000)}K+`;
	}

	onDone() {
		this.completeTour();
	}

	startTour() {
		this.joyrideService.startTour(
			{
				steps: ['step1', 'step2', 'nav1@app', 'issues1@issues',
					'solution1@solutions', 'suggestion1@suggestions',
					'suggestion2@suggestions'],
				showPrevButton: true,
				stepDefaultPosition: 'top'
			}
		).subscribe(
			() => {
				this.onDone();
			}
		);
	}

	completeTour() {
		const user = this.auth.credentials.user;
		user.completedTour = true;
		this.userService.patch({ id: user._id, entity: user })
			.subscribe(
				(res) => {
					this.auth.saveTourToLocalStorage();
					this.openSnackBar('Tour Complete', 'OK');
				},
				(err) => {
					console.log(err, 'this is err');
				}
			)
	}

	
	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}
}
