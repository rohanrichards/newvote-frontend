import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { IMedia } from '@app/core/models/media.model';

const routes = {
	list: (c: MediaContext) => `/media`,
	view: (c: MediaContext) => `/media/${c.id}`,
	create: (c: MediaContext) => `/media`,
	update: (c: MediaContext) => `/media/${c.id}`,
	delete: (c: MediaContext) => `/media/${c.id}`,
	meta: (c: MediaContext) => `/meta/${c.uri}`
};

export interface MediaContext {
	id?: string; // id of object to find/modify
	entity?: IMedia; // the object being created or edited
	params?: any;
	uri?: string;
	forceUpdate?: boolean;
}

@Injectable()
export class MediaService {

	constructor(private httpClient: HttpClient) { }

	list(context: MediaContext): Observable<any[]> {
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

	view(context: MediaContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	create(context: MediaContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	update(context: MediaContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	delete(context: MediaContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

	meta(context: MediaContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.meta(context))
			.pipe(
				map((res: any) => res),
				catchError((e) => of({ error: e }))
			);
	}

}
