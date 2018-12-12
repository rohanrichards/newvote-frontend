import { Injectable, Inject, Injector, forwardRef } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';
import { OrganizationService } from './organization/organization.service';

/**
 * Prefixes all requests with `environment.serverUrl`.
 */
@Injectable()
export class OganizationHeaderInterceptor implements HttpInterceptor {
	organisationService: OrganizationService;

	constructor(private inj: Injector) {
	}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.organisationService = this.inj.get(OrganizationService);
		const org = this.organisationService.subdomain;
		if (org) {
			// const headers = request.headers;
			const req = request.clone({ setParams: { organization: org } });
			// request.headers.append('organization', org.url);
			console.log(req);
			return next.handle(req);
		} else {
			return next.handle(request);
		}
	}
}
