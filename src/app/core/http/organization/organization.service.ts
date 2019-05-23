import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscriber, of, BehaviorSubject } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';

import { Organization } from '@app/core/models/organization.model';

const routes = {
	list: (c: OrganizationContext) => `/organizations`,
	view: (c: OrganizationContext) => `/organizations/${c.id}`,
	create: (c: OrganizationContext) => `/organizations`,
	update: (c: OrganizationContext) => `/organizations/${c.id}`,
	updateOwner: (c: OrganizationContext) => `/organizations/owner/${c.id}`,
	delete: (c: OrganizationContext) => `/organizations/${c.id}`
};

export interface OrganizationContext {
	// The solution's category: 'dev', 'explicit'...
	orgs?: Array<string>; // users organisations
	id?: string; // id of object to find/modify
	entity?: Organization; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class OrganizationService {
	private _host: string;
	private _subdomain: string;
	private _org: Organization;
	private $org: BehaviorSubject<any>;

	constructor(private httpClient: HttpClient
	) {
		this._host = document.location.host;
		this._subdomain = this._host.split('.')[0];

		let params = new HttpParams();
		const paramObject = { 'url': this._subdomain };
		params = new HttpParams({ fromObject: paramObject });

		if (!this.$org) {
			this.$org = <BehaviorSubject<any>>new BehaviorSubject({});

			this.httpClient
				.get('/organizations', { params })
				.pipe(
					map((res: Array<Organization>) => res[0]),
					catchError((e) => of({ error: e }))
				).subscribe((org: Organization) => {
					this._org = org;
					this.$org.next(org);
				});
		}
	}

	// gets the current organization from the url
	get(): Observable<any> {
		return this.$org.asObservable();
	}

	list(context: OrganizationContext): Observable<any[]> {
		// create blank params object
		let params = new HttpParams();

		// if we have params provided in the context, replace with those
		if (context.params) {
			// context.params is assumed to have a format similar to
			// { topicId: [id], search: [search terms], ...}
			params = new HttpParams({ fromObject: context.params });
		}

		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.list(context), { params })
			.pipe(
				map((res: Array<any>) => res),
				catchError((e) => of([{ error: e }]))
			);
	}

	view(context: OrganizationContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	create(context: OrganizationContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	update(context: OrganizationContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	setFutureOwner(context: OrganizationContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.updateOwner(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e}))
			);
	}

	delete(context: OrganizationContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
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
