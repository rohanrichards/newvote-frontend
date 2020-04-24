import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'
import { handleError } from '@app/core/http/errors'
import { RepStore } from './rep.store'
import { IRep, Rep } from '@app/core/models/rep.model'

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
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }

        if (context.orgs) {
            params = params.set('orgs', context.orgs.join(','))
        }

        const options = {
            withCredentials: true,
            params,
        }

        return this.httpClient
            .get(routes.list(), options)
            .pipe(
                tap((data: Rep[]) => {
                    this.store.add(data)
                }),
                map((res: Array<any>) => res),
                catchError(handleError)
            )
    }

    view(context: RepContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                tap((res: Rep) => {
                    this.store.add(res)
                }),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    create(context: RepContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                tap((res: any) => {
                    this.store.add(res.reps)
                }),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    update(context: RepContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                tap((rep: Rep) => this.store.upsert(rep._id, rep)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    updateMany(context: RepContext): Observable<any> {
        return this.httpClient
            .put(routes.updateMany(), context.entity)
            .pipe(
                tap((reps: any[]) => this.store.upsertMany(reps)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    delete(context: RepContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                tap((rep: Rep) => this.store.remove(rep._id)),
                map((res: any) => res),
                catchError(handleError)
            )
    }

    deleteMany(context: RepContext): Observable<any> {
        return this.httpClient
            .put(routes.deleteMany(), context.entity)
            .pipe(
                tap((reps: any) => {
                    const deletedIds = reps.slice().map((rep: any) => {
                        return rep._id
                    })
                    this.store.remove(deletedIds)
                }),
                map((res: any) => res),
                catchError(handleError)
            )
    }
}
