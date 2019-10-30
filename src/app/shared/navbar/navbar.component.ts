import { Component, OnInit, Input } from '@angular/core'
import { Organization } from '@app/core/models/organization.model'
import { AuthenticationService } from '@app/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { MetaService } from '@app/core/meta.service'
import { MatSidenav, MatSnackBar } from '@angular/material'
import { MediaObserver } from '@angular/flex-layout'
import { map, take } from 'rxjs/operators'
import { Location } from '@angular/common'
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
    routeLevel: string;
    isAuthenticated: boolean;
    showVerify: boolean;

    constructor(
        private meta: MetaService,
        private titleService: Title,
        private query: AuthenticationQuery,
        public auth: AuthenticationService,
        private router: Router,
        private media: MediaObserver,
        public snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        this.query.isLoggedIn$
            .subscribe((loggedIn: boolean) => {
                this.isAuthenticated = loggedIn
            })

        this.query.isCommunityVerified()
            .subscribe((verified) => {
                this.showVerify = this.checkVerify(verified, this.isAuthenticated)
            })

        this.meta.routeLevel$
            .subscribe((res) => {
                this.routeLevel = res
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

    // get isAuthenticated(): boolean {
    //     return this.auth.isAuthenticated()
    // }

    // get isVerified(): boolean {
    //     // debugger;
    //     if (this.isAuthenticated) {
    //         return (this.auth.isVerified())
    //     } else {
    //         return true
    //     }
    // }

    checkVerify(verified: boolean, loggedIn: boolean): boolean {
        if (!loggedIn) return false
        if (verified) return false
        if (!verified && !this.hideVerify) return true
        return false
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

    toggleVerify() {
        this.hideVerify = !this.hideVerify
    }

    handleVerify() {
        if (!this.query.isUserVerified() || !this.query.doesMobileNumberExist()) {
            return this.router.navigate(['/auth/verify'], { replaceUrl: true })
        }

        return this.auth.verifyWithCommunity()
            .subscribe(
                (res) => {
                    this.openSnackBar('You have successfully verified with this community.', 'OK')
                },
                (error) => {
                    console.log(error, 'this is error')
                    this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                })
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        })
    }
}
