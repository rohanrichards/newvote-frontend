import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { IProposal } from '@app/core/models/proposal.model';
import { handleError } from '@app/core/http/errors';
import { VoteService } from '../vote/vote.service';

const routes = {
	list: (c: ProposalContext) => `/proposals`,
	view: (c: ProposalContext) => `/proposals/${c.id}`,
	create: (c: ProposalContext) => `/proposals`,
	update: (c: ProposalContext) => `/proposals/${c.id}`,
	delete: (c: ProposalContext) => `/proposals/${c.id}`
};

export interface ProposalContext {
	// The proposal's category: 'dev', 'explicit'...
	orgs?: Array<string>; // users organisations
	id?: string; // id of object to find/modify
	entity?: IProposal; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class ProposalService {

	constructor(
		private voteService: VoteService,
		private httpClient: HttpClient) { }

	list(context: ProposalContext): Observable<any[]> {
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
				tap((data) => this.voteService.populateStore(data)),
				map((res: Array<any>) => res),
				catchError(handleError)
			);
	}

	view(context: ProposalContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	create(context: ProposalContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	update(context: ProposalContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	delete(context: ProposalContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

}
