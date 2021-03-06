import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { Logger } from '../logger.service'
import { AuthenticationService } from './authentication.service'
import { AuthenticationQuery } from './authentication.query'

const log = new Logger('ModeratorGuard')

@Injectable()
export class ModeratorGuard implements CanActivate {

    constructor(private router: Router,
        private auth: AuthenticationQuery) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.auth.isModerator()) {
            return true
        }

        log.debug('Not authorized...')
        // this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
        return false
    }

}
