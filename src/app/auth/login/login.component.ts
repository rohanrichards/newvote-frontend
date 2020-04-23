import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { finalize } from 'rxjs/operators'
import { MetaService } from '@app/core/meta.service'

import { environment } from '@env/environment'
import { Logger, I18nService, AuthenticationService, OrganizationService } from '@app/core'
import { Organization } from '@app/core/models/organization.model'
import { CookieService } from 'ngx-cookie-service'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'

const log = new Logger('Login')

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
    adminLogin: boolean;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private i18nService: I18nService,
        private authenticationService: AuthenticationService,
        private meta: MetaService,
        private cookieService: CookieService,
        private organizationService: OrganizationService,
        private auth: AuthenticationQuery,
        private organizationQuery: OrganizationQuery
    ) {
        this.createForm()
    }

    ngOnInit() {
        this.organizationQuery.select()
            .subscribe((res) => {
                if (!res._id) return false
                this.org = res
            })

        this.route.params.subscribe(
            (res: any) => {
                const { id } = res
                if (!id) return false
                this.fetchData(id)
            }
        )

        this.meta.updateTags(
            {
                title: 'Login',
                description: 'Fill in your account information to sign in.'
            })

        this.adminLogin = !!this.route.snapshot.queryParamMap.get('admin')
    }

    fetchData(organization: any) {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        this.organizationService.view({ id: organization, params })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    login() {
        this.isLoading = true

        this.authenticationService.login(this.loginForm.value)
            .pipe(finalize(() => {
                this.loginForm.markAsPristine()
                this.isLoading = false
            }))
            .subscribe(credentials => {
                log.debug(`${credentials.user.email} successfully logged in`)
                this.route.queryParams.subscribe(
                    params => {
                        if (credentials.user.verified) {
                            this.router.navigate([params.redirect || '/'], { replaceUrl: true })
                        } else {
                            this.router.navigate([params.redirect || '/auth/verify'], { replaceUrl: true })
                        }
                    }
                )
            }, error => {
                log.debug(`Login error: ${error}`)
                this.error = error
            })
    }

    setLanguage(language: string) {
        this.i18nService.language = language
    }

    get currentLanguage(): string {
        return this.i18nService.language
    }

    get languages(): string[] {
        return this.i18nService.supportedLanguages
    }

    loginWithSSO() {
        let url

        this.cookieService.set('orgUrl', this.org.url, null, '/', '.newvote.org')
        if (this.org.authEntityId) {
            url = this.adminLogin ? `${this.org.authUrl}` : `${this.org.authUrl}?entityID=${this.org.authEntityId}`
        } else {
            url = `${this.org.authUrl}`
        }

        return window.open(url, '_self')
    }

    private createForm() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            remember: true
        })
    }

}
