import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { IMedia, Media } from '@app/core/models/media.model'
import { MediaStore } from './media.store'
import { VoteService } from '../vote/vote.service'

const routes = {
    list: (c: MediaContext) => '/media',
    view: (c: MediaContext) => `/media/${c.id}`,
    create: (c: MediaContext) => '/media',
    update: (c: MediaContext) => `/media/${c.id}`,
    delete: (c: MediaContext) => `/media/${c.id}`,
    meta: (c: MediaContext) => `/meta/${c.uri}`
}

export interface MediaContext {
    id?: string; // id of object to find/modify
    entity?: IMedia; // the object being created or edited
    params?: any;
    uri?: string;
    forceUpdate?: boolean;
}

@Injectable()
export class MediaService {

    constructor(
        private httpClient: HttpClient,
        private mediaStore: MediaStore,
        private voteService: VoteService
    ) { }

    list(context: MediaContext): Observable<any[]> {
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }

        return this.httpClient
            .get(routes.list(context), { params })
            .pipe(
                tap((res: Media[]) => {
                    this.voteService.populateStore(res)
                    this.mediaStore.add(res)
                }),
                map((res: Array<any>) => res),
                catchError((e) => of([{ error: e }]))
            )
    }

    view(context: MediaContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                tap((res: Media) => {
                    this.voteService.addEntityVote(res)
                    this.mediaStore.add(res)
                }),
                map((res: any) => res),
                catchError((e) => of({ error: e }))
            )
    }

    create(context: MediaContext): Observable<any> {
        return this.httpClient
            .post(routes.create(context), context.entity)
            .pipe(
                tap((res: Media) => this.mediaStore.add(res)),
                map((res: any) => res),
                catchError((e) => of({ error: e }))
            )
    }

    update(context: MediaContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                tap((res: Media) => this.mediaStore.update(res._id, res)),
                map((res: any) => res),
                catchError((e) => of({ error: e }))
            )
    }

    delete(context: MediaContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                tap((res: Media) => this.mediaStore.remove(res._id)),
                map((res: any) => res),
                catchError((e) => of({ error: e }))
            )
    }

    meta(context: MediaContext): Observable<any> {
        return this.httpClient
            .get(routes.meta(context))
            .pipe(
                map((res: any) => res),
                catchError((e) => of({ error: e }))
            )
    }

    updateSuggestionVote(id: string, media: any) {
        this.mediaStore.update(id, media)
    }

}
