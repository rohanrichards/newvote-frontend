import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { ISolution } from '@app/core/models/solution.model';
import { handleError } from '@app/core/http/errors';
import { VoteService } from '../vote/vote.service';

const routes = {
	list: (c: SolutionContext) => `/solutions`,
	view: (c: SolutionContext) => `/solutions/${c.id}`,
	create: (c: SolutionContext) => `/solutions`,
	update: (c: SolutionContext) => `/solutions/${c.id}`,
	delete: (c: SolutionContext) => `/solutions/${c.id}`
};

export interface SolutionContext {
	// The solution's category: 'dev', 'explicit'...
	orgs?: Array<string>; // users organisations
	id?: string; // id of object to find/modify
	entity?: ISolution; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class SolutionService {

	constructor(private httpClient: HttpClient,
				private voteService: VoteService
		) { }

	list(context: SolutionContext): Observable<any[]> {
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
				tap((res) => console.log(res)),
				map((res: Array<any>) => res),
				catchError(handleError)
			);
	}

	view(context: SolutionContext): Observable<any> {

		let params = new HttpParams();

		if (context.params) {
			params = new HttpParams({fromObject: context.params});
		}

		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context), { params })
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	create(context: SolutionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	update(context: SolutionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	delete(context: SolutionContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	passDataToVoteService(serverData: any) {
		this.voteService.populateStore(serverData, 'Solution');
	} 

}
