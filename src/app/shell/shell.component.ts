import { Title } from '@angular/platform-browser';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService, I18nService } from '@app/core';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';
import {MatSidenavModule, MatDrawer} from '@angular/material/sidenav';
import { ObservableMedia } from '@angular/flex-layout';

@Component({
	selector: 'app-shell',
	templateUrl: './shell.component.html',
	styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
	organization: any;
	@Output() closeSearch = new EventEmitter();
	opened: boolean;
	@ViewChild(MatDrawer) matDrawer: MatDrawer;

	constructor(
		private titleService: Title,
		private router: Router,
		private i18nService: I18nService,
		private organizationService: OrganizationService,
		private matSideNav: MatSidenavModule,
		private media: ObservableMedia
	) { }

	ngOnInit() {
		console.log(this.matSideNav, 'this is mat')
		this.organizationService.get().subscribe(org => {
			this.organization = org;
		});
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
	}


	get languages(): string[] {
		return this.i18nService.supportedLanguages;
	}

	get isMobile(): boolean {
		return this.media.isActive('xs') || this.media.isActive('sm');
	}

	visitOrganizationUrl (event: any) {
		event.preventDefault();
		let { organizationUrl: url } = this.organization;
		url = this.setHttp(url);
		window.open(url, '_blank');
	}

	setHttp(link: string) {
		if (link.search(/^http[s]?\:\/\//) === -1) {
			link = 'https://' + link;
		}
		return link;
	}

	redirectToLanding() {
		const { hostname } = window.location;

		// separate the current hostname into subdomain and main site
		const splitHostname = hostname.split('.');
		splitHostname[0] = 'app';

		const newHostName = splitHostname.join('.');
		// window.location.href = `http://${newHostName}:${window.location.port}`;
		// window.open(`http://${newHostName}:${window.location.port}`, '_self');
		this.router.navigate(['/landing']);
	}

}
