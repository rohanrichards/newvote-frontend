import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MetaService } from '@app/core/meta.service';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService, OrganizationService } from '@app/core';
import { Organization } from '@app/core/models/organization.model';

const log = new Logger('Login');

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	version: string = environment.version;
	error: string;
	loginForm: FormGroup;
	isLoading = false;
	org: Organization;

	constructor(private router: Router,
		private route: ActivatedRoute,
		private formBuilder: FormBuilder,
		private i18nService: I18nService,
		private authenticationService: AuthenticationService,
		private meta: MetaService,
		private organizationService: OrganizationService,
		private cookieService: CookieService
	) {
		this.createForm();
		this.organizationService.get().subscribe(org => {
			this.org = org;
		});
	}

	ngOnInit() {
		this.meta.updateTags(
			{
				title: `Sign in`,
				description: 'Fill in your account information to sign in.'
			});
	}

	login() {
		this.isLoading = true;


		this.authenticationService.login(this.loginForm.value)
			.pipe(finalize(() => {
				this.loginForm.markAsPristine();
				this.isLoading = false;
			}))
			.subscribe(credentials => {
				log.debug(`${credentials.user.email} successfully logged in`);
				this.route.queryParams.subscribe(
					params => {
						// console.log(params);
						if (credentials.user.verified) {
							this.router.navigate([params.redirect || '/'], { replaceUrl: true });
						} else {
							this.router.navigate([params.redirect || '/auth/verify'], { replaceUrl: true });
						}
					}
				);
			}, error => {
				log.debug(`Login error: ${error}`);
				this.error = error;
			});
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
	}

	get currentLanguage(): string {
		return this.i18nService.language;
	}

	get languages(): string[] {
		return this.i18nService.supportedLanguages;
	}

	redirect() {
		this.cookieService.set('org', this.org.url, null, '/', '.newvote.org');
		window.location.href = this.org.authUrl;
	}

	private createForm() {
		this.loginForm = this.formBuilder.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
			remember: true
		});
	}


}
