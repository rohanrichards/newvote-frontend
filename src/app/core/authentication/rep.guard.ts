import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { Logger } from '../logger.service'
import { AuthenticationQuery } from './authentication.query'
import { RepQuery } from '../http/rep/rep.query'

const log = new Logger('RepGuard')

@Injectable()
export class RepGuard implements CanActivate {

    constructor(private router: Router,
        private auth: AuthenticationQuery,
        private repQuery: RepQuery) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const urlSplit = state.url.split('/')
        const repId = urlSplit[urlSplit.length - 1]
        if (this.repQuery.repGuard(repId)) {
            return true
        }

        log.debug('Not authorized...')
        this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
        return false
    }

}
