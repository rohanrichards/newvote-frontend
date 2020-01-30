import { Component, OnInit, Input } from '@angular/core'
import { Organization } from '@app/core/models/organization.model'
import { AuthenticationService } from '@app/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { MetaService } from '@app/core/meta.service'
import { MatSidenav } from '@angular/material'
import { MediaObserver } from '@angular/flex-layout'
import { map, take } from 'rxjs/operators'
import { Location } from '@angular/common'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Component({
    selector: 'div[sticky-component]',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    @Input() organization: Organization;
    @Input() sideNavRef: MatSidenav;

    showSearch = false;
    hideVerify = false;

    isRep = false

    routeLevel: string;
    userId: string;

    constructor(
        private meta: MetaService,
        private titleService: Title,
        public auth: AuthenticationService,
        private authQuery: AuthenticationQuery,
        private router: Router,
        private media: MediaObserver,
        private route: ActivatedRoute,
        private location: Location,
        public repQuery: RepQuery
    ) { }

    ngOnInit() {
        this.meta.routeLevel$
            .subscribe((res) => {
                this.routeLevel = res
            })

        this.repQuery.isRep()
            .subscribe((res) => {
                if (!res) return false
                this.isRep = res
            })

        this.repQuery.repId$
            .subscribe((res) => {
                if (!res) return false
                this.userId = res._id
            })
    }

    toggleSearch() {
        this.showSearch = !this.showSearch
    }

    logout() {
        this.auth.logout()
            .subscribe(() => this.router.navigate(['/auth/login'], { replaceUrl: true }))
    }

    get title(): string {
        return this.meta.getAppBarTitle()
    }

    get isAuthenticated(): boolean {
        return this.auth.isAuthenticated()
    }

    get isVerified(): boolean {
        // debugger;
        if (this.isAuthenticated) {
            return (this.auth.isVerified())
        } else {
            return true
        }
    }

    get showVerify(): boolean {
        if (this.isVerified) {
            return false
        }
        if (!this.isVerified && !this.hideVerify) {
            return true
        } else {
            return false
        }
    }

    get isCommunityVerified(): boolean {
        return this.auth.isCommunityVerified()
    }

    get isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm')
    }

    get username(): string | null {
        const credentials = this.auth.credentials
        return credentials ? credentials.user.username : null
    }

    handleToggle() {
        this.sideNavRef.toggle()
    }

    handleBackClick() {
        this.route.paramMap.pipe(
            take(1),
            map((data) => {
                return {
                    params: data,
                    state: window.history.state
                }
            })
        )
            .subscribe(({ state }) => {
                const redirect = !!state.login

                if (redirect) {
                    return this.router.navigate(['/'])
                }

                return this.location.back()
            })

    }
}
