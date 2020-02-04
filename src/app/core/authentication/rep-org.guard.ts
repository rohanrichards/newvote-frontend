import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RepQuery } from '../http/rep/rep.query';
import { Logger } from '../logger.service'
import { AuthenticationQuery } from './authentication.query';

const log = new Logger('RepOrgGuard')

@Injectable({
    providedIn: 'root'
})
export class RepOrgGuard implements CanActivate {
    constructor(
        private router: Router,
        private repQuery: RepQuery,
        private authQuery: AuthenticationQuery
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {
        
        console.log('RUNING REP-ORG')
        if (this.authQuery.isModerator()) {
            return true
        }
        
        if (this.repQuery.isRepForOrg()) {
            return true
        }

        log.debug('Not authorized...')
        this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
        return false
    }

}
