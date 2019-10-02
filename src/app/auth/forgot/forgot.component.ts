import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { finalize, take } from 'rxjs/operators';
import { MetaService } from '@app/core/meta.service';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';

const log = new Logger('Forgot');

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {

    version: string = environment.version;
    error: any;
    forgotForm: FormGroup;
    resetForm: FormGroup;
    isLoading = false;
    state = 'initial';
    // states= initial, sent, token
    siteKey = environment.recaptchaSitekey;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private i18nService: I18nService,
        private authenticationService: AuthenticationService,
        private meta: MetaService
    ) {
        this.createForms();
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const token = params.get('token');
            const email = params.get('email');
            if (token && email) {
                this.resetForm.patchValue({ token, email });
                this.state = 'token';
            }
        });

        this.meta.updateTags(
            {
                title: `Reset password`,
                description: 'Forgot your password? No worries!'
            });

        this.route.data
            .pipe(
                take(1)
            )
            .subscribe((res) => {
                this.meta.updateRouteLevel(res.level);
            })
    }

    forgot() {
        this.isLoading = true;
        this.authenticationService.forgot(this.forgotForm.value)
            .pipe(finalize(() => {
                this.forgotForm.markAsPristine();
                this.isLoading = false;
            }))
            .subscribe(credentials => {
                // set state to show reset form
                this.state = 'sent';
            }, (res: any) => {
                log.debug(`There was an error: ${res}`);
                this.error = res.error ? res.error : res;
            });
    }

    reset() {
        this.isLoading = true;
        this.authenticationService.reset(this.resetForm.value)
            .pipe(finalize(() => {
                this.resetForm.markAsPristine();
                this.isLoading = false;
            }))
            .subscribe(() => {
                this.router.navigate(['/auth/login'], { replaceUrl: true, state: { login: true } });
            }, (res: any) => {
                log.debug(`Forgot error: ${res}`);
                this.error = res.error ? res.error : res;
            });
    }

    private createForms() {
        this.forgotForm = this.formBuilder.group({
            email: new FormControl('', [Validators.required, Validators.email]),
            recaptchaResponse: new FormControl('', [Validators.required])
        });

        this.resetForm = this.formBuilder.group({
            email: new FormControl('', [Validators.required, Validators.email]),
            token: new FormControl('', [Validators.required]),
            newPassword: new FormControl('', [Validators.required]),
            verifyPassword: new FormControl('', [Validators.required])
        });
    }
}
