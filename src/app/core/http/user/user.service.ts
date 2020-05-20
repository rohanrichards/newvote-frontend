import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { IUser, IProfile } from '@app/core/models/user.model'
import { handleError } from '../errors'
import { AuthenticationStore } from '@app/core/authentication/authentication.store'
import { AuthenticationService } from '@app/core/authentication/authentication.service'

const routes = {
    list: () => '/users',
    count: () => '/users/count',
    // view: (c: UserContext) => `/users/${c.id}`,
    // create: (c: UserContext) => `/users`,
    update: (c: ProfileContext) => `/users/${c.id}/edit`,
    // delete: (c: UserContext) => `/users/${c.id}`
    patch: (c: UserContext) => `/users/tour/${c.id}`,
    subscribe: (c: UserContext) => `/subscriptions/${c.id}`,
    unsubscribe: (c: UserContext) => `/subscriptions/${c.id}`,
}

interface ApiContext {
    id?: string; // id of object to find/modify
    params?: any;
}

export interface UserContext extends ApiContext {
    entity?: IUser;
    subscription?: PushSubscription | null;
}

export interface ProfileContext extends ApiContext {
    entity?: IProfile;
}

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient, private store: AuthenticationStore, private authService: AuthenticationService) { }

    count(): Observable<any> {
        return this.httpClient
            .get(routes.count())
            .pipe(
                catchError((e) => of([{ error: e }])),
                map((res: Array<any>) => res),
            )
    }

    list(context: UserContext): Observable<any[]> {
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }
        const options = {
            withCredentials: true,
            params
        }

        return this.httpClient
            .get(routes.list(), options)
            .pipe(
                catchError((e) => of([{ error: e }])),
                map((res: Array<any>) => res)
            )
    }

    // view(context: UserContext): Observable<any> {
    //     return this.httpClient
    //         .get(routes.view(context))
    //         .pipe(
    //             map((res: any) => res),
    //             catchError((e) => of({ error: e }))
    //         );
    // }

    // create(context: UserContext): Observable<any> {
    //     return this.httpClient
    //         .post(routes.create(context), context.entity)
    //         .pipe(
    //             map((res: any) => res),
    //             catchError((e) => of({ error: e }))
    //         );
    // }

    // update(context: UserContext): Observable<any> {
    //     return this.httpClient
    //         .put(routes.update(context), context.entity)
    //         .pipe(
    //             map((res: any) => res),
    //             catchError((e) => of({ error: e }))
    //         );
    // }

    update(context: ProfileContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError((e) => handleError(e)),
                tap((res: any) => {
                    const { displayName, subscriptions } = res
                    this.store.update({ displayName, subscriptions })
                    const credentials = this.authService.credentials
                    console.log(credentials, 'this is credentials');
                    this.authService.updateCredentials(res)
                }),
                map((res: any) => res),
            );
    }

    patch(context: UserContext): Observable<any> {
        return this.httpClient
            .patch(routes.patch(context), context.entity)
            .pipe(
                catchError((e) => of({ error: e })),
                map((res: any) => res),
            )
    }

    addPushSubscriber(context: UserContext) {
        return this.httpClient
            .post(routes.subscribe(context), context.subscription)
            .pipe(
                catchError((e) => handleError(e)),
                map((res: any) => res)
            )
    }

    removePushSubscriber(context: UserContext) {
        return this.httpClient
            .put(routes.unsubscribe(context), context.subscription)
            .pipe(
                catchError((e) => handleError(e)),
                tap((res: any) => this.store.update({ pushSubscription: null })),
                map((res: any) => res)
            )
    }

    // delete(context: UserContext): Observable<any> {
    //     return this.httpClient
    //         .delete(routes.delete(context))
    //         .pipe(
    //             map((res: any) => res),
    //             catchError((e) => of({ error: e }))
    //         );
    // }

}
