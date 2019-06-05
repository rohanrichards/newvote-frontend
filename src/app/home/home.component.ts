import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { OrganizationService } from '@app/core';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { UserService } from '@app/core/http/user/user.service';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { MetaService } from '@app/core/meta.service';

import { Issue } from '@app/core/models/issue.model';
import { Organization } from '@app/core/models/organization.model';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	isLoading: boolean;
	org: Organization;
	issues: Issue[];
	solutions: any[];
	proposals: any[];
	userCount: number;

	ISSUE_LIMIT = 6;

	constructor(
		public auth: AuthenticationService,
		private organizationService: OrganizationService,
		private issueService: IssueService,
		private solutionService: SolutionService,
		private proposalService: ProposalService,
		private userService: UserService,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.organizationService.get().subscribe((org) => {
			this.org = org;
			this.meta.updateTags(
				{
					title: 'Home'
				});
		});

		this.fetchData();
		// this.issueService.list({ forceUpdate: false }).subscribe((issues) => this.issues = issues);
		this.solutionService.list({forceUpdate: false}).subscribe((solutions) => this.solutions = solutions);
		this.proposalService.list({ forceUpdate: false }).subscribe((proposals) => this.proposals = proposals);
		this.userService.count({ forceUpdate: false }).subscribe((count) => this.userCount = count);
	}

	fetchData(force?: boolean) {
		const isOwner = this.auth.isOwner();

		this.isLoading = true;
		this.issueService.list({
			orgs: [],
			forceUpdate: force,
			// params: isOwner ? { 'showDeleted': true } :  {}
		})
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(issues => { this.issues = issues; console.log(this.issues); });
	}

	onSoftDelete(issue: any) {
		this.isLoading = true;
		issue.softDeleted = true;
		this.issueService.update({ id: issue._id, entity: issue })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {	this.fetchData(true); });
	}

}
