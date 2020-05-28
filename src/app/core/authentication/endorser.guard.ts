import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { Logger } from '../logger.service'
import { AuthenticationService } from './authentication.service'
import { AuthenticationQuery } from './authentication.query'

const log = new Logger('EndorserGuard')

@Injectable()
export class EndorserGuard implements CanActivate {

    constructor(private router: Router,
        private authenticationService: AuthenticationService,
        private authenticationQuery: AuthenticationQuery) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.authenticationQuery.hasRole('endorser') || this.authenticationQuery.isAdmin()) {
            return true
        }

        log.debug('Not authorized...')
        // this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
        return false
    }

}
