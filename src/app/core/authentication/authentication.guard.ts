import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { Logger } from '../logger.service'
import { AuthenticationService } from './authentication.service'
import { AuthenticationQuery } from './authentication.query'

const log = new Logger('AuthenticationGuard')

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private router: Router,
        private authenticationService: AuthenticationService, private authQuery: AuthenticationQuery) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.authenticationService.isAuthenticated() && this.authQuery.isCommunityVerified()) {
            return true
        }

        log.debug('Not authenticated, redirecting and adding redirect url...')
        this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true })
        return false
    }

}
