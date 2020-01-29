import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

import { Vote } from '@app/core/models/vote.model'
import { handleError } from '@app/core/http/errors'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '../organization/organization.service'
import { VoteStore } from './vote.store'
import { cloneDeep } from 'lodash'
import { Socket } from 'ngx-socket-io'

const routes = {
    list: () => '/votes',
    view: (c: VoteContext) => `/votes/${c.id}`,
    create: () => '/votes',
    update: (c: VoteContext) => `/votes/${c.id}`,
    delete: (c: VoteContext) => `/votes/${c.id}`
}

export interface VoteContext {
    // The vote's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: Vote; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class VoteService {

    private _org: Organization;

    constructor(
        private socket: Socket,
        private httpClient: HttpClient,
        private orgService: OrganizationService,
        private voteStore: VoteStore,
    ) {
        this.orgService.get().subscribe(org => { this._org = org })

        this.socket.fromEvent('vote')
            .subscribe((vote: any) => {
                this.updateStoreVote(vote)
            })
    }

    list(context: VoteContext): Observable<any[]> {
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
                map((res: Array<any>) => res),
            )
    }

    view(context: VoteContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                map((res: any) => res),
            )
    }

    create(context: VoteContext): Observable<any> {
        context.entity.organizationId = this._org._id
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                map((res: any) => res),
            )
    }

    update(context: VoteContext): Observable<any> {
        context.entity.organizationId = this._org._id
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                map((res: any) => res),
            )
    }

    delete(context: VoteContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                map((res: any) => res),
            )
    }

    addEntityVote(data: any) {
        const entity = cloneDeep(data)

        let votes = [] as any
        const vote = entity.votes
        vote._id = entity._id

        // if (entity.proposals) {
        //     const proposals = entity.proposals.slice().reduce((prev: any, curr: any) => {
        //         let pItems = prev || [];
        //         curr.votes._id = curr._id;
        //         return pItems.concat(curr.votes);
        //     }, []);

        //     votes = votes.concat(proposals);
        // }

        votes = votes.concat(vote)
        this.voteStore.add(votes)
        return entity
    }

    populateStore(data: any) {
        // copy server object to remove references
        const serverData = cloneDeep(data)

        // Reduce starts with an empty array[], and iterates through each
        // item in the serverData array and appending voteMetaData Objects

        // If there is a proposal object, we concat those objects to the main array
        // resulting in an array of voteMetaData Objects composed from all different entity types
        const votes = serverData.reduce((previous: any, current: any) => {
            // either start with or reuse accumulated data
            let items = previous || []

            // if (current.proposals) {
            //     const proposals = current.proposals.slice().reduce((prev: any, curr: any) => {
            //         let pItems = prev || [];
            //         curr.votes._id = curr._id;
            //         return pItems.concat(curr.votes);
            //     }, []);

            //     items = items.concat(proposals);
            // }

            //     Entity types can have no vote meta data if newly created so apply here
            current.votes._id = current._id
            items = items.concat(current.votes)
            return items
        }, [])

        // Populate redux store
        this.voteStore.add(votes)
        return data
    }

    updateStoreVote(voteMetaData: any) {
        this.voteStore.upsert(voteMetaData._id, voteMetaData)
    }

}
