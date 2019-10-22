import { Injectable } from '@angular/core'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http'
import { Injector } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { environment } from '@env/environment'
import { Logger } from '../logger.service'
import { AuthenticationService } from '@app/core/authentication/authentication.service'

const log = new Logger('ErrorHandlerInterceptor')

/**
 * Adds a default error handler to all requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
    constructor(private router: Router, private inj: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(error => this.errorHandler(error)))
    }

    // Customize the default error handler here if needed
    private errorHandler(response: HttpEvent<any>): Observable<HttpEvent<any>> {
        if (!environment.production) {
            // Do something with the error
            log.error('Request error', response)
        }

        // unauthorized
        if (response instanceof HttpErrorResponse) {
            const error = response
            if (error.status === 401) {
                log.error('User is not authenticated - please log in')
                const auth = this.inj.get(AuthenticationService)
                auth.logout()
                this.router.navigate(['/auth/login'], { queryParams: { redirect: this.router.url } })
            } else if (error.status === 403) {
                log.error('User is not authorized')
                if (error.error.role && error.error.role === 'user') {
                    log.error('User has guest role, verification required')
                    this.router.navigate(['/auth/verify'], { queryParams: { redirect: this.router.url } })
                }

                if (error.error.notCommunityVerified) {
                    this.router.navigate(['/auth/login'], { queryParams: { redirect: this.router.url } })
                }
            }
        }

        throw response
    }

}
