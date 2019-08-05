import { Component, OnInit } from '@angular/core';
import { OrganizationService, AuthenticationService } from '@app/core';
import { Organization } from '@app/core/models/organization.model';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';

@Component({
selector: 'app-communities',
templateUrl: './communities.component.html',
styleUrls: ['./communities.component.scss']
})
export class CommunitiesComponent implements OnInit {
	organizations: Organization[];

	constructor(
		private organizationService: OrganizationService,
		private auth: AuthenticationService,
		private state: StateService
	) { }

	ngOnInit() {
		this.fetchData(true);
	}

	fetchData(force?: boolean) {
		const isAdmin = this.auth.isAdmin();
		// this.state.setLoadingState(AppState.loading);

		this.organizationService.list({
			orgs: [],
			forceUpdate: force,
			params: {
				'showDeleted': isAdmin ? 'true' : '',
				'showPrivate': isAdmin ? 'true' : 'false'
			}
		})
		.subscribe(
			organizations => {
				this.organizations = organizations;
				// return this.stateService.setLoadingState(AppState.complete);
			},
			(error) => {
				// return this.stateService.setLoadingState(AppState.serverError);
			}
		);
	}

	handleClick() {
		window.open('https://forms.gle/euRUWDLaGPAyZe2d6', '_blank');
	}

	openCommunityURL(event: any, url: string) {
		event.preventDefault();
		const { hostname } = window.location;
		// separate the current hostname into subdomain and main site
		const splitHostname = hostname.split('.');
		splitHostname[0] = url;

		const newHostName = splitHostname.join('.');
		window.location.href = `http://${newHostName}:${window.location.port}`;
	}
}
