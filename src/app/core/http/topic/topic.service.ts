import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { ITopic, Topic } from '@app/core/models/topic.model'
import { handleError } from '@app/core/http/errors'
import { TopicStore } from './topic.store'

const routes = {
    list: () => '/topics',
    view: (c: TopicContext) => `/topics/${c.id}`,
    create: () => '/topics',
    update: (c: TopicContext) => `/topics/${c.id}`,
    delete: (c: TopicContext) => `/topics/${c.id}`
}

export interface TopicContext {
    // The topic's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: ITopic; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class TopicService {

    constructor(
        private httpClient: HttpClient,
        private topicStore: TopicStore,
    ) { }

    list(context: TopicContext): Observable<any[]> {
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }

        return this.httpClient
            .get(routes.list(), { params })
            .pipe(
                tap((topics: Topic[]) => this.topicStore.add(topics)),
                map((res: Array<any>) => res),
                catchError(handleError)
            )
    }

    view(context: TopicContext): Observable<any> {

        return this.httpClient
            .get(routes.view(context))
            .pipe(
                tap((topic: Topic) => this.topicStore.add(topic)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    create(context: TopicContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                tap((topic: Topic) => this.topicStore.add(topic)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    update(context: TopicContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                tap((topic: Topic) => this.topicStore.upsert(topic._id, topic)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    delete(context: TopicContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                tap((topic: Topic) => this.topicStore.remove(topic._id)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

}
