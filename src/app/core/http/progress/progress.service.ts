import { Injectable } from '@angular/core'
import { ProgressStore } from './progress.store'
import { HttpClient, HttpParams } from '@angular/common/http'
import { tap, catchError } from 'rxjs/operators'
import { IProgress, Progress } from '@app/core/models/progress.model'
import { Observable } from 'rxjs'
import { handleError } from '../errors'

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

        return this.http
            .get(routes.list(), options)
            .pipe(
                tap(entities => this.progressStore.set(entities))
            )
    }

    create(context: ProgressContext): Observable<Progress> {
        return this.http
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((progress: Progress) => this.progressStore.add(progress))
            )
    }

    view(context: ProgressContext): Observable<Progress> {
        return this.http
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((progress: Progress) => this.progressStore.add(progress))
            )
    }

    update(context: ProgressContext): Observable<Progress> {
        return this.http
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((progress: Progress) => this.progressStore.upsert(progress._id, progress))
            )
    }

    delete(context: ProgressContext): Observable<Progress> {
        return this.http
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((progress: Progress) => this.progressStore.remove(progress._id))
            )
    }
}
