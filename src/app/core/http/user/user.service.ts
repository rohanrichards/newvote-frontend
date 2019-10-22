import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

import { IUser } from '@app/core/models/user.model'

const routes = {
    list: () => '/users',
    count: () => '/users/count',
    // view: (c: UserContext) => `/users/${c.id}`,
    // create: (c: UserContext) => `/users`,
    // update: (c: UserContext) => `/users/${c.id}`,
    // delete: (c: UserContext) => `/users/${c.id}`
    patch: (c: UserContext) => `/users/tour/${c.id}`
}

export interface UserContext {
    id?: string; // id of object to find/modify
    entity?: IUser; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient) { }

    count(): Observable<any> {
        return this.httpClient
            .get(routes.count())
            .pipe(
                map((res: Array<any>) => res),
                catchError((e) => of({ error: e }))
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
                map((res: Array<any>) => res),
                catchError((e) => of([{ error: e }]))
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

    patch(context: UserContext): Observable<any> {
        return this.httpClient
            .patch(routes.patch(context), context.entity)
            .pipe(
                map((res: any) => res),
                catchError((e) => of({ error: e }))
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
