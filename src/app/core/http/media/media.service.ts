import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { IMedia, Media } from '@app/core/models/media.model'
import { MediaStore } from './media.store'
import { VoteService } from '../vote/vote.service'

const routes = {
    list: () => '/media',
    view: (c: MediaContext) => `/media/${c.id}`,
    create: () => '/media',
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
            .get(routes.list(), { params })
            .pipe(
                catchError((e) => of([{ error: e }])),
                tap((res: any) => {
                    this.voteService.addMetaDataVotes(res.addMetaDataVotes)
                    this.mediaStore.add(res)
                    if (res.userVoteData) {
                        this.voteService.addUserVotes(res.userVoteData)
                    }
                }),
                map((res: Array<any>) => res),
            )
    }

    view(context: MediaContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                catchError((e) => of([{ error: e }])),
                tap((res: any) => {
                    const { medias, voteMetaData, userVoteData } = res
                    this.voteService.addMetaDataVotes(voteMetaData)
                    this.mediaStore.add(medias)
                    if (userVoteData) {
                        this.voteService.addUserVotes(userVoteData)
                    }
                }),
                map((res: any) => res)
            )
    }

    create(context: MediaContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError((e) => of([{ error: e }])),
                tap((res: Media) => this.mediaStore.add(res)),
                map((res: any) => res),
            )
    }

    update(context: MediaContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError((e) => of([{ error: e }])),
                tap((res: Media) => this.mediaStore.update(res._id, res)),
                map((res: any) => res)
            )
    }

    delete(context: MediaContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError((e) => of([{ error: e }])),
                tap((res: Media) => this.mediaStore.remove(res._id)),
                map((res: any) => res)
            )
    }

    meta(context: MediaContext): Observable<any> {
        return this.httpClient
            .get(routes.meta(context))
            .pipe(
                catchError((e) => of([{ error: e }])),
                map((res: any) => res)
            )
    }

    updateMediaVote(id: string, media: any) {
        this.mediaStore.update(id, media)
    }

}
