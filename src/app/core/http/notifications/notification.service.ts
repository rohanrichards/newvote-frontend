import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'
import { handleError } from '@app/core/http/errors'
import { INotification, Notification } from '@app/core/models/notification.model'
import { NotificationStore } from './notification.store'

const routes = {
    list: () => '/notifications',
    view: (c: NotificationContext) => `/notifications/${c.id}`,
    create: () => '/notifications',
    update: (c: NotificationContext) => `/notifications/${c.id}`,
    delete: (c: NotificationContext) => `/notifications/${c.id}`
}

export interface NotificationContext {
    // The solution's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: INotification; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class NotificationService {

    constructor(
        private httpClient: HttpClient,
        private store: NotificationStore
    ) { }

    list(context: NotificationContext): Observable<any[]> {
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
                catchError(handleError),
                tap((data: any) => {
                    this.store.add(data)
                }),
                map((res: Array<any>) => res)
            )
    }

    view(context: NotificationContext): Observable<any> {

        let params = new HttpParams()

        if (context.params) {
            params = new HttpParams({ fromObject: context.params })
        }

        return this.httpClient
            .get(routes.view(context), { params })
            .pipe(
                catchError(handleError),
                tap((res: any) => {
                    this.store.add(res)
                }),
                map((res: any) => res)
            )
    }

    create(context: NotificationContext): Observable<any> {
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }

        return this.httpClient
            .post(routes.create(), context.entity, { params })
            .pipe(
                catchError(handleError),
                tap((notification: Notification) => {
                    this.store.add(notification)
                }),
                map((res: any) => res)
            )
    }

    update(context: NotificationContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((notification: Notification) => this.store.update(notification._id, notification)),
                map((res: any) => res)
            )
    }

    delete(context: NotificationContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((notification: Notification) => {
                    this.store.remove(notification._id)
                }),
                map((res: any) => res)
            )
    }

}
