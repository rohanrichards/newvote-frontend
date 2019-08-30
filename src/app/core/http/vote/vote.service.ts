import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Vote } from '@app/core/models/vote.model';
import { handleError } from '@app/core/http/errors';
import { OrganizationListComponent } from '@app/organization/list/organization-list.component';
import { Organization } from '@app/core/models/organization.model';
import { OrganizationService } from '../organization/organization.service';

const routes = {
	list: (c: VoteContext) => `/votes`,
	view: (c: VoteContext) => `/votes/${c.id}`,
	create: (c: VoteContext) => `/votes`,
	update: (c: VoteContext) => `/votes/${c.id}`,
	delete: (c: VoteContext) => `/votes/${c.id}`
};

export interface VoteContext {
	// The vote's category: 'dev', 'explicit'...
	orgs?: Array<string>; // users organisations
	id?: string; // id of object to find/modify
	entity?: Vote; // the object being created or edited
	params?: any;
	forceUpdate?: boolean;
}

@Injectable()
export class VoteService {

	private _org: Organization;

	constructor(
		private httpClient: HttpClient,
		private orgService: OrganizationService
	) {
		this.orgService.get().subscribe(org => this._org = org);
	}

	list(context: VoteContext): Observable<any[]> {
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

	view(context: VoteContext): Observable<any> {
		return this.httpClient
			.cache(context.forceUpdate)
			.get(routes.view(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	create(context: VoteContext): Observable<any> {
		context.entity.organizationId = this._org._id;
		return this.httpClient
			.post(routes.create(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	update(context: VoteContext): Observable<any> {
		context.entity.organizationId = this._org._id;
		return this.httpClient
			.put(routes.update(context), context.entity)
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	delete(context: VoteContext): Observable<any> {
		return this.httpClient
			.delete(routes.delete(context))
			.pipe(
				map((res: any) => res),
				catchError(handleError)
			);
	}

	populateStore(serverData: any, parent: string) {
		let items;

		// Reduce starts with an empty array [], and iterates through each
		// item in serverData array and returning an array of voteMetaData objects

		// If there are proposal object as children, we concat those objects to the main array
		// creating an array of voteMetaData Objects from all different entity types

		// reduce serverData to transform array of Soltion objects to an array of
		// solution voteMetaData Objects + solution proposal voteMetaData Objects
		items = serverData.reduce((prev: any, curr:any) => {
			// either start with or reuse accumulated data
			let items = prev || [];
		  
			if (curr.proposals) {
				const proposals = curr.proposals.reduce((prev:any, curr:any) => {
					let pItems = prev || [];
					curr.votes._id = curr._id;
					return pItems.concat(curr.votes);
				}, []);
			}
			
		  	curr.votes._id = curr._id;
			return items.concat(curr.votes);
		}, [])
	}
}
