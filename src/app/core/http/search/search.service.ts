import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


const routes = {
	topic: (c: SearchContext) => `/topics?search=${c.query}`,
	issue: (c: SearchContext) => `/issues?search=${c.query}`,
	solution: (c: SearchContext) => `/solutions?search=${c.query}`,
};

export interface SearchContext {
	query: string;
	forceUpdate?: boolean;
}

@Injectable()
export class SearchService {

	constructor(private httpClient: HttpClient) { }

	all(context: SearchContext): Observable<any[]> {

		const topicObs = this.httpClient
			.cache(context.forceUpdate)
			.get(routes.topic(context))
			.pipe(
				catchError((e) => of([{ error: e }]))
			);

		const issueObs = this.httpClient
			.cache(context.forceUpdate)
			.get(routes.issue(context))
			.pipe(
				catchError((e) => of([{ error: e }]))
			);

		const solutionObs = this.httpClient
			.cache(context.forceUpdate)
			.get(routes.solution(context))
			.pipe(
				catchError((e) => of([{ error: e }]))
			);

		return forkJoin([topicObs, issueObs, solutionObs]).pipe(
			map((resultsArray: Array<any>) => {
				return [].concat.apply([], resultsArray);
			})
		);
	}

}
