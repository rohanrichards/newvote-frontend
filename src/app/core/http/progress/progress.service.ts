import { Injectable } from '@angular/core'
import { ProgressStore } from './progress.store'
import { HttpClient, HttpParams } from '@angular/common/http'
import { tap, catchError } from 'rxjs/operators'
import { IProgress, Progress } from '@app/core/models/progress.model'
import { Observable } from 'rxjs'
import { handleError } from '../errors'
import { cacheable } from '@datorama/akita'

export interface ProgressContext {
    id?: string;
    entity?: IProgress;
    params?: any;
}

const routes = {
    create: () => '/progress',
    list: () => '/progress',
    view: (c: ProgressContext) => `/progress/${c.id}`,
    update: (c: ProgressContext) => `/progress/${c.id}`,
    delete: (c: ProgressContext) => `/progress/${c.id}`,
}

@Injectable({ providedIn: 'root' })
export class ProgressService {

    constructor(private progressStore: ProgressStore,
        private http: HttpClient) {
    }

    get(context: ProgressContext): Observable<any> {
        let params = new HttpParams()

        if (context.params) {
            params = new HttpParams({ fromObject: context.params })
        }

        const options = {
            withCredentials: true,
            params
        }

        const request$ = this.http
            .get(routes.list(), options)
            .pipe(
                tap((entities: any) => {
                    this.progressStore.set(entities)
                })
            )

        return cacheable(this.progressStore, request$)
    }

    create(context: ProgressContext): Observable<Progress> {
        const request$ = this.http
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((progress: Progress) => {
                    this.progressStore.add(progress)
                })
            )

        return cacheable(this.progressStore, request$)
    }

    view(context: ProgressContext): Observable<Progress> {
        const request$ = this.http
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((progress: Progress) => this.progressStore.add(progress))
            )

        return cacheable(this.progressStore, request$)
    }

    update(context: ProgressContext): Observable<Progress> {
        const request$ = this.http
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((progress: IProgress) => this.progressStore.upsert(progress._id, progress))
            )

        return cacheable(this.progressStore, request$)
    }

    delete(context: ProgressContext): Observable<Progress> {
        const request$ = this.http
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((progress: IProgress) => this.progressStore.remove(progress._id))
            )

        return cacheable(this.progressStore, request$)
    }
}
