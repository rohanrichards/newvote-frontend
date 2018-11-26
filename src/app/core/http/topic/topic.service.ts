import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ITopic } from '@app/core/models/topic.model';

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
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.list(context))
			.pipe(
				map((res: Array<any>) => res),
				catchError((e) => of([{error: e}]))
			);
	}

	view(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({error: e}))
			);
	}

	create(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({error: e}))
			);
	}

	update(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({error: e}))
			);
	}

	delete(context: TopicContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({error: e}))
			);
	}

}
