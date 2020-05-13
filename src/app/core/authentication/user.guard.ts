import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationQuery } from './authentication.query';
import { Logger } from '../logger.service'

const log = new Logger('UserGuard')

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
    // canActivate(
    //   next: ActivatedRouteSnapshot,
    //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    //   return true;
    // }

    constructor(private router: Router,
      private auth: AuthenticationQuery
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.auth.isUserVerified()) {
            return true
        }

        log.debug('Not authorized...')
        this.router.navigate(['/'])
        return false
    }
}
