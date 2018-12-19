import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscriber, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Organization } from '@app/core/models/organization.model';

@Injectable()
export class OrganizationService {
	private _host: string;
	private _subdomain: string;
	private _org: Organization;

	constructor(@Inject(DOCUMENT) private document: any,
		private httpClient: HttpClient) {
		this._host = document.location.host;
		this._subdomain = this._host.split('.')[0];
		console.log('Your subdomain: ', this._subdomain);
	}

	get(): Observable<any> {
		let params = new HttpParams();
		const paramObject = { 'url': this._subdomain };

		params = new HttpParams({ fromObject: paramObject });

		return this.httpClient
			.cache()
			.get('/organizations', { params })
			.pipe(
				map((res: Array<Organization>) => {
					console.log('org: ', res);
					this._org = res[0];
					return res[0];
				}),
				catchError((e) => of({ error: e }))
			);
	}

	get org() {
		return this._org || null;
	}

	get subdomain() {
		return this._subdomain;
	}
}
