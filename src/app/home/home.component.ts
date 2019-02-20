import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { OrganizationService } from '@app/core';
import { IssueService } from '@app/core/http/issue/issue.service';
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
	proposals: any[];
	userCount: number;

	constructor(
		public auth: AuthenticationService,
		private organizationService: OrganizationService,
		private issueService: IssueService,
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
		this.issueService.list({ forceUpdate: false }).subscribe((issues) => this.issues = issues);
		this.proposalService.list({ forceUpdate: false }).subscribe((proposals) => this.proposals = proposals);
		this.userService.count({ forceUpdate: false }).subscribe((count) => this.userCount = count);

	}

}
