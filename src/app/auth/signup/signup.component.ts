import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { finalize, take } from 'rxjs/operators';
import { MetaService } from '@app/core/meta.service';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService, OrganizationService } from '@app/core';
import { Organization } from '@app/core/models/organization.model';
import { arrayExpression } from 'babel-types';
import { ReCaptcha2Component } from 'ngx-captcha';

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
    org: Organization;

    siteKey = environment.recaptchaSitekey;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private i18nService: I18nService,
        private authenticationService: AuthenticationService,
        private meta: MetaService,
        private organizationService: OrganizationService
    ) {
        this.createForm();
        this.organizationService.get().subscribe(org => {
            this.org = org;
        });
    }

    @ViewChild('captchaElem', { static: false }) captchaElem: ReCaptcha2Component;

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
                this.resetCaptcha();
                log.debug(`${credentials.user.username} successfully logged in`);
                this.route.queryParams.subscribe(
                    params => this.router.navigate([params.redirect || '/auth/verify'], { replaceUrl: true, state: { login: true } })
                );
            }, (res: any) => {
                log.debug(`Signup error: ${res}`);
                this.error = res.error ? res.error : res;
                this.resetCaptcha();
            });
    }

    redirect() {
        // window.location.href = this.org.authUrl;
        window.open(this.org.authUrl, '_self');
    }


    resetCaptcha(): void {
        this.captchaElem.resetCaptcha();
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
