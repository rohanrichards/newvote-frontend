import { Component, OnInit, Input } from '@angular/core';
import { Organization } from '@app/core/models/organization.model';
import { AuthenticationService } from '@app/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MetaService } from '@app/core/meta.service';
import { MatSidenav } from '@angular/material';
import { MediaObserver } from '@angular/flex-layout';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	@Input() organization: Organization;
	@Input() sideNavRef: MatSidenav;

	showSearch = false;
	hideVerify = false;

	constructor(
		private meta: MetaService,
		private titleService: Title,
		public auth: AuthenticationService,
		private router: Router,
		private media: MediaObserver,
	) { }

	ngOnInit() {
	}

	toggleSearch() {
		this.showSearch = !this.showSearch;
	}

	logout() {
		this.auth.logout()
			.subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
	}

	get title(): string {
		return this.meta.getAppBarTitle();
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

	get isMobile(): boolean {
		return this.media.isActive('xs') || this.media.isActive('sm');
	}

	get username(): string | null {
		const credentials = this.auth.credentials;
		return credentials ? credentials.user.username : null;
	}

	handleToggle()  {
		this.sideNavRef.toggle();
	}
}
