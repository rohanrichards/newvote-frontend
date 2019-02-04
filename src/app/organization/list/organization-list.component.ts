import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { VoteService } from '@app/core/http/vote/vote.service';

import { IOrganization, Organization } from '@app/core/models/organization.model';
import { Vote } from '@app/core/models/vote.model';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-list.component.html',
	styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {

	organizations: Array<any>;
	isLoading: boolean;
	headerTitle = 'Administrate Organizations';
	headerText = 'Admin panel for managing organizations';
	headerButtons = [{
		text: 'New Organization',
		color: 'warn',
		routerLink: '/organizations/create',
		role: 'admin'
	}];

	constructor(private organizationService: OrganizationService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit() {
		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
	}

	fetchData(force?: boolean) {
		this.isLoading = true;
		this.organizationService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(organizations => { this.organizations = organizations; });
	}

	onDelete(event: any) {
		this.organizationService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

}
