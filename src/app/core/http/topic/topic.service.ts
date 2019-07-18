import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ITopic } from '@app/core/models/topic.model';
import { handleError } from '@app/core/http/errors';

const routes = {
	list: (c: TopicContext) => `/topics`,
	view: (c: TopicContext) => `/topics/${c.id}`,
	create: (c: TopicContext) => `/topics`,
	update: (c: TopicContext) => `/topics/${c.id}`,
	delete: (c: TopicContext) => `/topics/${c.id}`
};

export interface TopicContext {
	// The topic's category: 'dev', 'explicit'...
	orgs?: Array<string>; // users organisations
	id?: string; // id of object to find/modify
	entity?: ITopic; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class TopicService {

	constructor(private httpClient: HttpClient) { }

	list(context: TopicContext): Observable<any[]> {
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
				catchError(handleError)
			);
	}

	view(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	create(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	update(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	delete(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

}
