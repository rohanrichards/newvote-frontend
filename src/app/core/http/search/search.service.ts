import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, forkJoin } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

const routes = {
    topic: (c: SearchContext) => `/topics?search=${c.query}`,
    issue: (c: SearchContext) => `/issues?search=${c.query}`,
    solution: (c: SearchContext) => `/solutions?search=${c.query}`,
    proposal: (c: SearchContext) => `/proposals?search=${c.query}`,
}

export interface SearchContext {
    query: string;
    forceUpdate?: boolean;
}

@Injectable()
export class SearchService {

    constructor(private httpClient: HttpClient) { }

    all(context: SearchContext): Observable<any[]> {

        const topicObs = this.httpClient
            .get(routes.topic(context))
            .pipe(
                map((arr: Array<any>) => {
                    return arr.map(o => {
                        o.schema = 'Topic'
                        return o
                    })
                }),
                catchError((e) => of([{ error: e }]))
            )

        const issueObs = this.httpClient
            .get(routes.issue(context))
            .pipe(
                map((arr: Array<any>) => {
                    return arr.map(o => {
                        o.schema = 'Issue'
                        return o
                    })
                }),
                catchError((e) => of([{ error: e }]))
            )

        const solutionObs = this.httpClient
            .get(routes.solution(context))
            .pipe(
                map((arr: Array<any>) => {
                    return arr.map(o => {
                        o.schema = 'Solution'
                        return o
                    })
                }),
                catchError((e) => of([{ error: e }]))
            )

        const proposalObs = this.httpClient
            .get(routes.proposal(context))
            .pipe(
                map((arr: Array<any>) => {
                    return arr.map(o => {
                        o.schema = 'Action'
                        return o
                    })
                }),
                catchError((e) => of([{ error: e }]))
            )

        return forkJoin([topicObs, issueObs, solutionObs, proposalObs]).pipe(
            map((resultsArray: Array<any>) => {
                return resultsArray.reduce((prev, curr) => {
                    return prev.concat(...curr)
                }, [])
            })
        )
    }

}
