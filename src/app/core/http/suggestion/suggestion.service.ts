import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { ISuggestion, Suggestion } from '@app/core/models/suggestion.model';
import { handleError } from '@app/core/http/errors';
import { VoteService } from '../vote/vote.service';
import { SuggestionStore } from './suggestion.store';

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
		private suggestionStore: SuggestionStore,
		private voteService: VoteService,
		private httpClient: HttpClient) { }

	list(context: SuggestionContext): Observable<Suggestion[]> {
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
				tap((data: Suggestion[]) => {
					this.voteService.populateStore(data);
					this.suggestionStore.add(data);
				}),
				catchError(handleError)
			);
	}

	view(context: SuggestionContext): Observable<Suggestion> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				tap((res: Suggestion) => {
					this.voteService.addEntityVote(res);
					this.suggestionStore.add(res);
				}),
				map((res: any) => res),
				catchError(handleError)
			);
	}

	create(context: SuggestionContext): Observable<Suggestion> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				tap((res: Suggestion) => this.suggestionStore.add(res)),
				map((res: any) => res),
				catchError(handleError)
			);
	}

	update(context: SuggestionContext): Observable<Suggestion> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				tap((res: Suggestion) => this.suggestionStore.update(res._id, res)),
				map((res: any) => res),
				catchError(handleError)
			);
	}

	delete(context: SuggestionContext): Observable<Suggestion> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				tap((res: any) => this.suggestionStore.remove(res._id)),
				map((res: any) => res),
				catchError(handleError)
			);
	}

	populateStoreMetaData(serverData: any) {
		this.voteService.populateStore(serverData);
	} 

	updateSuggestionVote(id: string, suggestion: any) {
		this.suggestionStore.update(id, suggestion);
	}
}
