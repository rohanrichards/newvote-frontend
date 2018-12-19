import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/**
 * Prefixes all requests with `environment.serverUrl`.
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {

	constructor(private tokenExtractor: HttpXsrfTokenExtractor) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = this.tokenExtractor.getToken() as string;
		console.log('token is: ', token);
		if (token) {
			if (!/^(http|https):/i.test(request.url)) {
				request = request.clone({
					url: environment.serverUrl + request.url,
					withCredentials: true,
					setHeaders: { 'X-XSRF-TOKEN': token }
				});
			} else {
				request = request.clone({
					withCredentials: true,
					setHeaders: { 'X-XSRF-TOKEN': token }
				});
			}
			return next.handle(request);
		} else {
			if (!/^(http|https):/i.test(request.url)) {
				request = request.clone({
					url: environment.serverUrl + request.url,
					withCredentials: true
				});
			} else {
				request = request.clone({
					withCredentials: true
				});
			}
			return next.handle(request);
		}

	}
}
