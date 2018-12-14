import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { IssueService } from '@app/core/http/issue/issue.service';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-list.component.html',
	styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

	issues: Array<any>;
	isLoading: boolean;
	headerTitle = 'Browse By Issue';
	headerText = 'Issues arrange the current issues into broader categories. \
		Select a issue below to learn more about it and explore relevant issues being discussed.';
	headerButtons = [{
		text: 'New Issue',
		color: 'warn',
		routerLink: '/issues/create',
		role: 'admin'
	}];

	constructor(private issueService: IssueService,
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
		this.issueService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(issues => { this.issues = issues; });
	}

	onDelete(event: any) {
		this.issueService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

}
