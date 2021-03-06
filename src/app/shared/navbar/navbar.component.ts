import { Component, OnInit, Input } from '@angular/core'
import { Organization } from '@app/core/models/organization.model'
import { AuthenticationService } from '@app/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { MetaService } from '@app/core/meta.service'
import { MatSidenav } from '@angular/material/sidenav';
import { MediaObserver } from '@angular/flex-layout'
import { map, take, delay } from 'rxjs/operators'
import { Location } from '@angular/common'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query'
import { SwPush } from '@angular/service-worker'
import { UserService } from '@app/core/http/user/user.service'

@Component({
    selector: 'div[sticky-component]',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
    @Input() organization: Organization
    @Input() sideNavRef: MatSidenav

    showSearch = false
    hideVerify = false
    routeLevel: string
    isAuthenticated: boolean
    showVerify: boolean
    isRep = false
    userId: string

    VERIFYDELAY = 1000
    delayPassed: any

    notificationSubscription = false
    subDisabled = false

    constructor(
        private meta: MetaService,
        private titleService: Title,
        public auth: AuthenticationService,
        private router: Router,
        private media: MediaObserver,
        private route: ActivatedRoute,
        private location: Location,
        public repQuery: RepQuery,
        public authQuery: AuthenticationQuery,
        private admin: AdminService,
        public access: AccessControlQuery,
        public orgQuery: OrganizationQuery,
        private swPush: SwPush,
        private userService: UserService,
    ) {}

    ngOnInit() {
        this.authQuery.isLoggedIn$.subscribe((loggedIn: boolean) => {
            this.isAuthenticated = loggedIn
            // need to delay the showing on the verification bar
            // when a user is loggedin and visits the app for the first time, there's a moment whenn
            // showVerify is false whilst user is loggedIn
            if (loggedIn && !this.delayPassed) {
                setTimeout(() => {
                    this.delayPassed = true
                }, this.VERIFYDELAY)
            }
        })

        this.authQuery.isCommunityVerified$.subscribe((verified: boolean) => {
            this.showVerify = this.checkVerify(verified, this.isAuthenticated)
        })

        this.meta.routeLevel$.subscribe(res => {
            this.routeLevel = res
        })

        this.repQuery.getRepId().subscribe((rep: any) => {
            if (!rep) return false
            this.userId = rep._id
        })

        this.repQuery.isRep().subscribe((res: any) => {
            if (!res) return false
            this.isRep = res
        })
    }

    toggleSearch() {
        this.showSearch = !this.showSearch
    }

    logout() {
        this.auth
            .logout()
            .subscribe(() => this.router.navigate(['/'], { replaceUrl: true }))
    }

    get title(): string {
        return this.meta.getAppBarTitle()
    }

    checkVerify(verified: boolean, loggedIn: boolean): boolean {
        if (!loggedIn) return false
        if (verified) return false
        if (!verified && !this.hideVerify) {
            return true
        }
        return false
    }

    get isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm')
    }

    get username(): string | null {
        const { username = null } = this.authQuery.getValue()
        return username
    }

    handleToggle() {
        this.sideNavRef.toggle()
    }

    handleBackClick() {
        this.route.paramMap
            .pipe(
                take(1),
                map(data => {
                    return {
                        params: data,
                        state: window.history.state,
                    }
                }),
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
        // If community is authType 0
        const userId = this.authQuery.getValue()._id;
        const { authType, url } = this.orgQuery.getValue()
        const canVerify = this.authQuery.canVerify()
        if (authType === 0) {
            if (!canVerify) {
                return this.router.navigate(['/auth/verify'], {
                    replaceUrl: true,
                })
            }

            return this.auth.verifyWithCommunity(userId).subscribe(
                res => {
                    this.admin.openSnackBar(
                        'You have successfully verified with this community.',
                        'OK',
                    )
                },
                error => {
                    this.admin.openSnackBar(
                        `Something went wrong: ${error.status} - ${error.statusText}`,
                        'OK',
                    )
                },
            )
        }

        if (authType === 1) {

            if (!canVerify) {
                return this.router.navigate(['/auth/login'], {
                    replaceUrl: true,
                })
            }
        }

        return this.auth.verifyWithCommunity(userId).subscribe(
            () => {
                this.admin.openSnackBar(
                    'You have successfully verified with this community.',
                    'OK',
                )
            },
            (error: any) => {
                this.admin.openSnackBar(
                    `Something went wrong: ${error.status} - ${error.statusText}`,
                    'OK',
                )
            },
        )
    }
}
