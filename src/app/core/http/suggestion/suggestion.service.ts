import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { ISuggestion, Suggestion } from '@app/core/models/suggestion.model'
import { handleError } from '@app/core/http/errors'
import { VoteService } from '../vote/vote.service'
import { SuggestionStore } from './suggestion.store'
import { cacheable } from '@datorama/akita'

const routes = {
    list: () => '/suggestions',
    view: (c: SuggestionContext) => `/suggestions/${c.id}`,
    create: () => '/suggestions',
    update: (c: SuggestionContext) => `/suggestions/${c.id}`,
    delete: (c: SuggestionContext) => `/suggestions/${c.id}`
}

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

    list(context: SuggestionContext): Observable<any> {
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
                tap((data: Suggestion[]) => {
                    this.voteService.populateStore(data)
                    this.suggestionStore.add(data)
                })
            )

        return cacheable(this.suggestionStore, request$)
    }

    view(context: SuggestionContext): Observable<any> {
        const request$ = this.httpClient
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((res: Suggestion) => {
                    this.voteService.addEntityVote(res)
                    this.suggestionStore.add(res)
                }),
            )
        return cacheable(this.suggestionStore, request$)
    }

    create(context: SuggestionContext): Observable<any> {
        const request$ = this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: Suggestion) => this.suggestionStore.add(res)),
            )
        return cacheable(this.suggestionStore, request$)
    }

    update(context: SuggestionContext): Observable<any> {
        const request$ = this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: Suggestion) => this.suggestionStore.update(res._id, res)),
                map((res: any) => res)
            )
        return cacheable(this.suggestionStore, request$)
    }

    delete(context: SuggestionContext): Observable<any> {
        const request$ = this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((res: any) => this.suggestionStore.remove(res._id)),
                map((res: any) => res),
            )
        return cacheable(this.suggestionStore, request$)
    }

    populateStoreMetaData(serverData: any) {
        this.voteService.populateStore(serverData)
    }

    updateFilter(filter: string) {
        this.suggestionStore.update({ filter })
    }

    updateOrder(order: string) {
        this.suggestionStore.update({ order });
    }
}
