import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query';

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {
    @Input() organization: any;
    @Output() close = new EventEmitter()
    isVerified: boolean;

    constructor(private router: Router, private media: MediaObserver,
        public auth: AuthenticationQuery,
        private access: AccessControlQuery
    ) { }

    ngOnInit() {
        this.access.isCommunityVerified$
            .subscribe((verified: boolean) => {
                this.isVerified = verified;
            })
    }

    redirectToLanding() {
        const { hostname } = window.location

        // separate the current hostname into subdomain and main site
        const splitHostname = hostname.split('.')
        splitHostname[0] = 'app'

        this.router.navigate(['/landing'])
    }

    get isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm')
    }

    handleClick() {
        this.close.emit()
    }

    visitOrganizationUrl(event: any) {
        event.preventDefault()
        let { organizationUrl: url } = this.organization
        url = this.setHttp(url)
        window.open(url, '_blank')
    }

    setHttp(link: string) {
        if (link.search(/^http[s]?\:\/\//) === -1) {
            link = 'https://' + link
        }
        return link
    }

}
