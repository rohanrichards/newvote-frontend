import { Component, OnInit } from '@angular/core';
import { OrganizationService, AuthenticationService } from '@app/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
	selector: 'app-discover',
	templateUrl: './discover.component.html',
	styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {

	organizations: Array<any>;
	isLoading = false;

	headerTitle = 'Discover New Organizations';
	headerText = 'Find out who is active on NewVote';

	constructor(
		private organizationService: OrganizationService,
		public auth: AuthenticationService,
		private router: Router
	) { }

	ngOnInit() {
		this.fetchData();
	}

	fetchData(force?: boolean) {
		this.isLoading = true;
		this.organizationService.list({ orgs: [], forceUpdate: force })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(organizations => { this.organizations = organizations; console.log(organizations, 'this is orgs')});
	}

	getUrl (url: string) {
		const { hostname } = window.location;

		// separate the current hostname into subdomain and main site
		const splitHostname = hostname.split('.');
		splitHostname[0] = url;

		const newHostName = splitHostname.join('.');
		return `http://${newHostName}:4200`;
	}
}
