import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MetaService } from '@app/core/meta.service';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';
import { arrayExpression } from 'babel-types';

const log = new Logger('Signup');

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

	version: string = environment.version;
	error: any;
	signupForm: FormGroup;
	isLoading = false;
	verificationCode: string;

	constructor(private router: Router,
		private route: ActivatedRoute,
		private formBuilder: FormBuilder,
		private i18nService: I18nService,
		private authenticationService: AuthenticationService,
		private meta: MetaService,
	) {
		this.createForm();
	}

	ngOnInit() {
		this.meta.updateTags(
			{
				title: `Create account`,
				description: 'Make your voice heard, create an account today!'
			});

		// extract verificationCode if directed via email
		this.verificationCode = this.route.snapshot.params.id
			? this.route.snapshot.params.id
			: '';
	}

	signup() {
		this.isLoading = true;
		this.authenticationService.signup(this.signupForm.value, this.verificationCode)
			.pipe(finalize(() => {
				this.signupForm.markAsPristine();
				this.isLoading = false;
			}))
			.subscribe(credentials => {
				log.debug(`${credentials.user.username} successfully logged in`);
				this.route.queryParams.subscribe(
					params => this.router.navigate([params.redirect || '/auth/verify'], { replaceUrl: true })
				);
			}, (res: any) => {
				log.debug(`Signup error: ${res}`);
				this.error = res.error ? res.error : res;
			});
	}

	private createForm() {
		this.signupForm = this.formBuilder.group({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required, Validators.minLength(6)]),
			remember: true,
			recaptchaResponse: new FormControl('', [Validators.required])
		});
	}

}
