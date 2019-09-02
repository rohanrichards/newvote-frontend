import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ISuggestion, Suggestion } from '@app/core/models/suggestion.model';
import { handleError } from '@app/core/http/errors';
import { VoteService } from '../vote/vote.service';

const routes = {
	list: (c: SuggestionContext) => `/suggestions`,
	view: (c: SuggestionContext) => `/suggestions/${c.id}`,
	create: (c: SuggestionContext) => `/suggestions`,
	update: (c: SuggestionContext) => `/suggestions/${c.id}`,
	delete: (c: SuggestionContext) => `/suggestions/${c.id}`
};

export interface SuggestionContext {
	id?: string; // id of object to find/modify
	entity?: ISuggestion; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class SuggestionService {

	constructor(
		private voteService: VoteService,
		private httpClient: HttpClient) { }

	list(context: SuggestionContext): Observable<any[]> {
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
				catchError(handleError)
			);
	}

	view(context: SuggestionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	create(context: SuggestionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	update(context: SuggestionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	delete(context: SuggestionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	populateStoreMetaData(serverData: any) {
		this.voteService.populateStore(serverData);
	} 

}
