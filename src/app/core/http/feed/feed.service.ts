import { Injectable } from '@angular/core'
import { FeedStore } from './feed.store'
import { HttpClient } from '@angular/common/http'
import { tap, catchError } from 'rxjs/operators'
import { IFeed, Feed } from '@app/core/models/feed.model'
import { Observable } from 'rxjs'
import { handleError } from '../errors'

export interface FeedContext {
    id?: string;
    entity?: IFeed;
    params?: any;
}

const routes = {
    create: () => '/feed',
    view: (c: FeedContext) => `/feeds/${c.id}`,
    update: (c: FeedContext) => `/feeds/${c.id}`,
    delete: (c: FeedContext) => `/feeds/${c.id}`
}

@Injectable({ providedIn: 'root' })
export class FeedService {

    constructor(private feedStore: FeedStore,
        private http: HttpClient) {
    }

    get() {
        return this.http.get('').pipe(tap(entities => this.feedStore.set(entities)))
    }

    create(context: FeedContext): Observable<Feed> {
        return this.http
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((feed: Feed) => this.feedStore.add(feed))
            )
    }

    view(context: FeedContext): Observable<Feed> {
        return this.http
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((feed: Feed) => this.feedStore.add(feed))
            )
    }

    update(context: FeedContext): Observable<Feed> {
        return this.http
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((feed: Feed) => this.feedStore.upsert(feed._id, feed))
            )
    }

    delete(context: FeedContext): Observable<Feed> {
        return this.http
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((feed: Feed) => this.feedStore.remove(feed._id))
            )
    }
}
