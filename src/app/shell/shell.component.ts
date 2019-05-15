import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';

import { AuthenticationService, I18nService } from '@app/core';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';


@Component({
	selector: 'app-shell',
	templateUrl: './shell.component.html',
	styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
	organization: any;
	hideVerify = false;
	showSearch = false;

	constructor(private router: Router,
		private titleService: Title,
		private media: ObservableMedia,
		private auth: AuthenticationService,
		private i18nService: I18nService,
		private organizationService: OrganizationService,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.organizationService.get().subscribe(org => {
			this.organization = org;
		});
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
	}

	logout() {
		this.auth.logout()
			.subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
	}

	get username(): string | null {
		const credentials = this.auth.credentials;
		return credentials ? credentials.user.username : null;
	}

	get isAuthenticated(): boolean {
		return this.auth.isAuthenticated();
	}

	get isVerified(): boolean {
		// debugger;
		if (this.isAuthenticated) {
			return (this.auth.isVerified());
		} else {
			return true;
		}
	}

	get showVerify(): boolean {
		if (this.isVerified) {
			return false;
		}
		if (!this.isVerified && !this.hideVerify) {
			return true;
		} else {
			return false;
		}
	}

	toggleSearch() {
		this.showSearch = !this.showSearch;
	}

	get languages(): string[] {
		return this.i18nService.supportedLanguages;
	}

	get isMobile(): boolean {
		return this.media.isActive('xs') || this.media.isActive('sm');
	}

	get title(): string {
		return this.meta.getAppBarTitle();
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
}
