import { Injectable } from '@angular/core'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'

/**
 * Prefixes all requests with `environment.serverUrl`.
 */
@Injectable()
export class OganizationHeaderInterceptor implements HttpInterceptor {
	_host: string;
	_subdomain: string;

	constructor() {
	}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
	    this._host = document.location.host
	    this._subdomain = this._host.split('.')[0]
	    if (this._subdomain) {
	        const req = request.clone({ setParams: { organization: this._subdomain } })
	        return next.handle(req)
	    } else {
	        return next.handle(request)
	    }
	}
}
