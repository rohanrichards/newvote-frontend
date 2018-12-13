import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { IIssue } from '@app/core/models/issue.model';

const routes = {
	list: (c: IssueContext) => `/issues`,
	view: (c: IssueContext) => `/issues/${c.id}`,
	create: (c: IssueContext) => `/issues`,
	update: (c: IssueContext) => `/issues/${c.id}`,
	delete: (c: IssueContext) => `/issues/${c.id}`
};

export interface IssueContext {
	// The issue's category: 'dev', 'explicit'...
	orgs?: Array<string>; // users organisations
	id?: string; // id of object to find/modify
	entity?: IIssue; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class IssueService {

	constructor(private httpClient: HttpClient) { }

	list(context: IssueContext): Observable<any[]> {
		// create blank params object
		let params = new HttpParams();

		// if we have params provided in the context, replace with those
		if (context.params) {
			// context.params is assumed to have a format similar to
			// { topicId: [id], search: [search terms], ...}
			params = new HttpParams({fromObject: context.params});
		}

		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.list(context), { params })
			.pipe(
				map((res: Array<any>) => res),
				catchError((e) => of([{ error: e }]))
			);
	}

	view(context: IssueContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	create(context: IssueContext): Observable<any> {
		return this.httpClient
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	update(context: IssueContext): Observable<any> {
		return this.httpClient
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	delete(context: IssueContext): Observable<any> {
		return this.httpClient
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

}
