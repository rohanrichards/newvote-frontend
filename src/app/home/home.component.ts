import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { OrganizationService } from '@app/core';
import { IssueService } from '@app/core/http/issue/issue.service';

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

	constructor(
		private organizationService: OrganizationService,
		private issueService: IssueService
	) { }

	ngOnInit() {
		this.organizationService.get().subscribe((org) => this.org = org);
		this.issueService.list({ forceUpdate: false }).subscribe((issues) => this.issues = issues);
	}

}
