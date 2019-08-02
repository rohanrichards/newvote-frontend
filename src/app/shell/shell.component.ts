import { Title } from '@angular/platform-browser';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';
import { CookieService } from 'ngx-cookie-service';

import { AuthenticationService, I18nService } from '@app/core';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';
import { MatSidenavContent } from '@angular/material';

import { asyncScheduler, fromEvent } from 'rxjs';
import { filter, observeOn, scan, debounceTime, tap } from 'rxjs/operators';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';

interface ScrollPositionRestore {
	event: Event;
	positions: { [K: number]: number };
	trigger: 'imperative' | 'popstate';
	idToRestore: number;
}

@Component({
	selector: 'app-shell',
	templateUrl: './shell.component.html',
	styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
	organization: any;
	hideVerify = false;
	showSearch = false;

	@Output() closeSearch = new EventEmitter();
	@ViewChild(CdkScrollable) scrollable: CdkScrollable;

	scrollingSubscription: any;

	constructor(
		public scroll: ScrollDispatcher,
		private router: Router,
		private titleService: Title,
		private media: ObservableMedia,
		private auth: AuthenticationService,
		private i18nService: I18nService,
		private organizationService: OrganizationService,
		private meta: MetaService,
		private cookieService: CookieService
	) { 
		// NOTES
		// unless mat-sidenav-container / children have a fixed height i.e 100vh
		// the height property is passed all the way to the root app
		// at root we can't get scroll info
		// using CDK scrollable + container 'vh100' we can listen into scroll events on the content
		// need to find a way of tracking the page, the scroll position (scrollTop on data.elementRef)
		// saving that data and then triggering on page forward a scroll reset to 0
		// or if back is pushed the scrollposition is then applied after view init
		this.scrollingSubscription = this.scroll
		.scrolled()
		.subscribe((data: CdkScrollable) => {
			let element = data.elementRef;
			console.log(element, 'this is element');

			
		});
	}


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

	redirect() {
		this.cookieService.set('org', this.organization.url, null, '/', '.newvote.org');
		// window.location.href = this.org.authUrl;
		window.open(this.organization.authUrl, '_self');
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
