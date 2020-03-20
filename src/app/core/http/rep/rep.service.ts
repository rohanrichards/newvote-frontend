import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'
import { handleError } from '@app/core/http/errors'
import { RepStore } from './rep.store'
import { IRep, Rep } from '@app/core/models/rep.model'
import { cacheable } from '@datorama/akita'

const routes = {
    list: () => '/reps',
    view: (c: RepContext) => `/reps/${c.id}`,
    create: () => '/reps',
    update: (c: RepContext) => `/reps/${c.id}`,
    updateMany: () => '/reps',
    deleteMany: () => '/reps',
    delete: (c: RepContext) => `/reps/${c.id}`

}

export interface RepContext {
    // The Rep's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: any; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class RepService {

    constructor(
        private httpClient: HttpClient,
        private store: RepStore
    ) { }

    list(context?: RepContext): Observable<any[]> {
        // // create blank params object
        // let params = new HttpParams()

        // // if we have params provided in the context, replace with those
        // if (context.params) {
        //     // context.params is assumed to have a format similar to
        //     // { topicId: [id], search: [search terms], ...}
        //     params = new HttpParams({ fromObject: context.params })
        // }

        const request$ = this.httpClient
            .get(routes.list())
            .pipe(
                tap((data: Rep[]) => {
                    this.store.add(data)
                }),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }

    view(context: RepContext): Observable<any> {
        const request$ = this.httpClient
            .get(routes.view(context))
            .pipe(
                tap((res: Rep) => {
                    this.store.add(res)
                }),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }

    create(context: RepContext): Observable<any> {
        const request$ = this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                tap((res: any) => {
                    this.store.add(res.reps)
                }),
                map((res: any) => res),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }

    update(context: RepContext): Observable<any> {
        const request$ = this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                tap((rep: Rep) => this.store.upsert(rep._id, rep)),
                map((res: any) => res),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }

    updateMany(context: RepContext): Observable<any> {
        const request$ = this.httpClient
            .put(routes.updateMany(), context.entity)
            .pipe(
                tap((reps: any[]) => this.store.upsertMany(reps)),
                map((res: any) => res),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }

    delete(context: RepContext): Observable<any> {
        const request$ = this.httpClient
            .delete(routes.delete(context))
            .pipe(
                tap((rep: Rep) => this.store.remove(rep._id)),
                map((res: any) => res),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }

    deleteMany(context: RepContext): Observable<any> {
        const request$ = this.httpClient
            .put(routes.deleteMany(), context.entity)
            .pipe(
                tap((reps: any) => {
                    const deletedIds = reps.slice().map((rep: any) => {
                        return rep._id
                    })
                    this.store.remove(deletedIds)
                }),
                catchError(handleError)
            )
        return cacheable(this.store, request$)
    }
}
