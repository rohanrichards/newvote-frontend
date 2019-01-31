import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';

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

	constructor(private router: Router,
		private route: ActivatedRoute,
		private formBuilder: FormBuilder,
		private i18nService: I18nService,
		private authenticationService: AuthenticationService) {
		this.createForm();
		console.log(environment.recaptchaSitekey);
	}

	ngOnInit() {
		this.authenticationService.randomGet().subscribe(res => console.log(res));
		// this.signupForm.statusChanges.subscribe(changes => {
		// 	console.log(changes);
		// 	console.log(this.signupForm);
		// });
	}

	signup() {
		this.isLoading = true;
		this.authenticationService.signup(this.signupForm.value)
			.pipe(finalize(() => {
				this.signupForm.markAsPristine();
				this.isLoading = false;
			}))
			.subscribe(credentials => {
				log.debug(`${credentials.user.username} successfully logged in`);
				this.route.queryParams.subscribe(
					params => this.router.navigate([params.redirect || '/'], { replaceUrl: true })
				);
			}, (res: any) => {
				log.debug(`Signup error: ${res}`);
				this.error = res.error ? res.error : res;
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

	private createForm() {
		this.signupForm = this.formBuilder.group({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required, Validators.minLength(6)]),
			remember: true,
			recaptchaResponse: new FormControl('', [Validators.required])
		});
	}

}
