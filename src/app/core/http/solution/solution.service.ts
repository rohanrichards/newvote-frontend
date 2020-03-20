import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { ISolution, Solution } from '@app/core/models/solution.model'
import { handleError } from '@app/core/http/errors'
import { VoteService } from '../vote/vote.service'
import { SolutionStore } from './solution.store'
import { cacheable } from '@datorama/akita'

const routes = {
    list: () => '/solutions',
    view: (c: SolutionContext) => `/solutions/${c.id}`,
    create: () => '/solutions',
    update: (c: SolutionContext) => `/solutions/${c.id}`,
    delete: (c: SolutionContext) => `/solutions/${c.id}`
}

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

    constructor(
        private httpClient: HttpClient,
        private voteService: VoteService,
        private solutionStore: SolutionStore
    ) { }

    list(context: SolutionContext): Observable<any[]> {
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }

        const request$ = this.httpClient
            .get(routes.list(), { params })
            .pipe(
                catchError(handleError),
                tap((data: any) => {
                    this.voteService.populateStore(data)
                    this.solutionStore.add(data)
                }),
            )
        return cacheable(this.solutionStore, request$)

    }

    view(context: SolutionContext): Observable<any> {

        let params = new HttpParams()

        if (context.params) {
            params = new HttpParams({ fromObject: context.params })
        }

        const request$ = this.httpClient
            .get(routes.view(context), { params })
            .pipe(
                catchError(handleError),
                tap((res: any) => {
                    this.voteService.addEntityVote(res)
                    this.solutionStore.add(res)
                }),
            )
        return cacheable(this.solutionStore, request$)
    }

    create(context: SolutionContext): Observable<any> {
        const request$ = this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((solution: Solution) => this.solutionStore.add(solution)),
                map((res: any) => res)
            )
        return cacheable(this.solutionStore, request$)
    }

    update(context: SolutionContext): Observable<any> {
        const request$ = this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((solution: Solution) => this.solutionStore.update(solution._id, solution)),
                map((res: any) => res)
            )
        return cacheable(this.solutionStore, request$)
    }

    delete(context: SolutionContext): Observable<any> {
        const request$ = this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((solution: Solution) => this.solutionStore.remove(solution._id)),
            )
        return cacheable(this.solutionStore, request$)
    }

    updateFilter(filter: string) {
        this.solutionStore.update({ filter })
    }

    updateOrder(order: string) {
        this.solutionStore.update({ order })
    }
}
