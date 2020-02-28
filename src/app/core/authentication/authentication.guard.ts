import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { Logger } from '../logger.service'
import { AuthenticationService } from './authentication.service'
import { AuthenticationQuery } from './authentication.query'
import { OrganizationQuery } from '../http/organization/organization.query'
import { AccessControlQuery } from '../http/mediators/access-control.query'
import { take } from 'rxjs/operators'
import { Observable } from 'rxjs'

const log = new Logger('AuthenticationGuard')

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private router: Router,
        private authenticationService: AuthenticationService,
        private access: AccessControlQuery,
        private authQuery: AuthenticationQuery, private org: OrganizationQuery) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const verified = this.access.isCommunityVerified()

        if (verified) return true

        log.debug('Not authenticated, redirecting and adding redirect url...')
        this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true })
        return false
    }

}
