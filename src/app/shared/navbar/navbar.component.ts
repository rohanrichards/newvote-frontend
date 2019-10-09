import { Component, OnInit, Input } from '@angular/core';
import { Organization } from '@app/core/models/organization.model';
import { AuthenticationService } from '@app/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MetaService } from '@app/core/meta.service';
import { MatSidenav, MatSnackBar } from '@angular/material';
import { MediaObserver } from '@angular/flex-layout';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { UserService } from '@app/core/http/user/user.service';
import { take } from 'rxjs/operators';
import { OrganizationQuery } from '@app/core/http/organization/organization.query';

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

    verified: boolean;
    loggedIn: boolean;

    constructor(
        private meta: MetaService,
        private titleService: Title,
        private query: AuthenticationQuery,
        public auth: AuthenticationService,
        private router: Router,
        private media: MediaObserver,
        public snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.query.isLoggedIn$.subscribe(
            (res) => this.loggedIn = res,
            (err) => err
        )

        this.query.isCommunityVerified$
            .subscribe((verified) => {
                this.verified = verified;
            })
    }

    toggleSearch() {
        this.showSearch = !this.showSearch;
    }

    logout() {
        this.auth.logout()
            .subscribe(() => this.router.navigate(['/auth/login'], { replaceUrl: true }));
    }

    get title(): string {
        return this.meta.getAppBarTitle();
    }

    get isAuthenticated(): boolean {
        return this.auth.isAuthenticated();
    }

    get isVerified(): boolean {
        // debugger;
        if (this.isAuthenticated) {
            return (this.auth.isVerified());
        } else {
            return true;
        }
    }

    get showVerify(): boolean {
        if (this.isVerified) {
            return false;
        }
        if (!this.isVerified && !this.hideVerify) {
            return true;
        } else {
            return false;
        }
    }

    get isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

    get username(): string | null {
        const credentials = this.auth.credentials;
        return credentials ? credentials.user.username : null;
    }

    handleToggle() {
        this.sideNavRef.toggle();
    }

    handleVerify() {
        if (!this.query.isUserVerified() || !this.query.doesMobileNumberExist()) {
            return this.router.navigate(['/auth/verify'], { replaceUrl: true })
        }

        return this.auth.verifyWithCommunity()
            .subscribe(
                (res) => {
                    this.openSnackBar('You have successfully verified with this community.', 'OK');
                },
                (error) => {
                    this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
                })
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        });
    }
}
