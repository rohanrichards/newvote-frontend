import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { finalize, take } from 'rxjs/operators'
import { MetaService } from '@app/core/meta.service'

import { environment } from '@env/environment'
import { Logger, I18nService, AuthenticationService, OrganizationService } from '@app/core'
import { Organization } from '@app/core/models/organization.model'
import { CookieService } from 'ngx-cookie-service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { VotesQuery } from '@app/core/http/vote/vote.query'

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
        private organizationService: OrganizationService,
        private cookieService: CookieService,
        private solutionService: SolutionService,
        private proposalService: ProposalService,
        private suggestionService: SuggestionService,
        private voteQuery: VotesQuery
    ) {
        this.createForm()
        this.organizationService.get().subscribe(org => {
            this.org = org
        })
    }

    ngOnInit() {
        this.meta.updateTags(
            {
                title: 'Sign in',
                description: 'Fill in your account information to sign in.'
            })

        this.adminLogin = !!this.route.snapshot.queryParamMap.get('admin')
    }

    login() {
        this.isLoading = true

        this.authenticationService.login(this.loginForm.value)
            .pipe(finalize(() => {
                this.loginForm.markAsPristine()
                this.isLoading = false
            }))
            .subscribe(credentials => {

                // If a user logs in after making a vote request, we take vote info from the response object

                if (credentials.voted) {

                    const vote = credentials.voted;
                    const { objectType, object } = credentials.voted;

                    this.voteQuery.selectEntity(object)
                        .pipe(
                            take(1)
                        )
                        .subscribe(
                            (storeVote) => {

                                const updatedEntity = {
                                    votes: {
                                        ...storeVote,
                                        currentUser: vote
                                    }
                                }

                                if (objectType === 'Solution') {
                                    this.solutionService.updateSolutionVote(object, updatedEntity)
                                }

                                if (objectType === 'Proposal') {
                                    this.proposalService.updateProposalVote(object, updatedEntity)
                                }

                                if (objectType === 'Suggestion') {
                                    this.suggestionService.updateSuggestionVote(object, updatedEntity)
                                }
                            },
                            (err) => err
                        )
                }

                // handle user if they have created 
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

    get isCommunityVerified(): boolean {
        return this.authenticationService.isCommunityVerified()
    }

    loginWithSSO() {
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        let url

        this.cookieService.set('redirect', redirect, null, '/', '.newvote.org')
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
