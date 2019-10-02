import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { finalize, take } from 'rxjs/operators';
import { MetaService } from '@app/core/meta.service';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';



const log = new Logger('Verify');

@Component({
    selector: 'app-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

    version: string = environment.version;
    state = 'initial';
    error: any;
    numberForm: FormGroup;
    verifyForm: FormGroup;
    isLoading = false;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private i18nService: I18nService,
        private authenticationService: AuthenticationService,
        private meta: MetaService
    ) {
        this.createForm();
    }

    ngOnInit() {
        this.meta.updateTags(
            {
                title: `Verify account`,
                description: 'The NewVote platform requires mobile verification'
            });

        this.route.data
            .pipe(
                take(1)
            )
            .subscribe((res) => {
                this.meta.updateRouteLevel(res.level);
            })
    }

    sendCode() {
        this.isLoading = true;
        this.authenticationService.sendVerificationCode(this.numberForm.value)
            .pipe(finalize(() => {
                this.numberForm.markAsPristine();
                this.isLoading = false;
            }))
            .subscribe(() => {
                log.debug(`sms sent`);
                this.state = 'sent';
            }, (res: any) => {
                log.debug(`SMS error: ${res}`);
                this.error = res.error ? res.error : res;
                this.state = 'initial';
            });
    }

    verify() {
        this.isLoading = true;
        this.authenticationService.verifyMobile(this.verifyForm.value)
            .pipe(finalize(() => {
                this.verifyForm.markAsPristine();
                this.isLoading = false;
            }))
            .subscribe((data: any) => {
                log.debug(`verification completed`);
                this.authenticationService.setVerified(data);
                // route out here
                this.route.queryParams.subscribe(
                    params => {
                        this.router.navigate([params.redirect || '/'], { replaceUrl: true, state: { login: true } });
                    }
                );
            }, (res: any) => {
                log.debug(`Verify error: ${res}`);
                this.error = res.error ? res.error : res;
            });
    }

    resetForms() {
        this.state = 'initial';
        // this.numberForm.reset();
        this.verifyForm.reset();
        this.error = null;
    }

    private createForm() {
        this.numberForm = this.formBuilder.group({
            country: new FormControl(''),
            number: new FormControl('', [Validators.required])
        });

        this.verifyForm = this.formBuilder.group({
            code: new FormControl('', [Validators.required])
        });
    }


}
