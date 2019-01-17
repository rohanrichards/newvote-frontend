import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { OrganizationService } from '@app/core';
import { IssueService } from '@app/core/http/issue/issue.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { UserService } from '@app/core/http/user/user.service';

import { Issue } from '@app/core/models/issue.model';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	isLoading: boolean;
	org: any;
	issues: Issue[];
	proposals: any[];
	userCount: number;

	constructor(
		private organizationService: OrganizationService,
		private issueService: IssueService,
		private proposalService: ProposalService,
		private userService: UserService
	) { }

	ngOnInit() {
		this.organizationService.get().subscribe((org) => this.org = org);
		this.issueService.list({ forceUpdate: false }).subscribe((issues) => this.issues = issues);
		this.proposalService.list({ forceUpdate: false }).subscribe((proposals) => this.proposals = proposals);
		this.userService.count({forceUpdate: false}).subscribe((count) => this.userCount = count);
	}

}
