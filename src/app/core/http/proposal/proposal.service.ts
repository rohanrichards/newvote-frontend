import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { IProposal, Proposal } from '@app/core/models/proposal.model'
import { handleError } from '@app/core/http/errors'
import { VoteService } from '../vote/vote.service'
import { ProposalStore } from './proposal.store'

const routes = {
    list: () => '/proposals',
    view: (c: ProposalContext) => `/proposals/${c.id}`,
    create: () => '/proposals',
    update: (c: ProposalContext) => `/proposals/${c.id}`,
    delete: (c: ProposalContext) => `/proposals/${c.id}`
}

export interface ProposalContext {
    // The proposal's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: IProposal; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class ProposalService {

    constructor(
        private voteService: VoteService,
        private httpClient: HttpClient,
        private proposalStore: ProposalStore
    ) { }

    list(context: ProposalContext): Observable<any[]> {
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
                tap((data: Proposal[]) => {
                    this.voteService.populateStore(data)
                    this.proposalStore.add(data)
                }),
                map((res: Array<any>) => res),
            )
    }

    view(context: ProposalContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((res: Proposal) => {
                    this.voteService.addEntityVote(res)
                    this.proposalStore.add(res)
                }),
                map((res: any) => res),
            )
    }

    create(context: ProposalContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: Proposal) => this.proposalStore.add(res)),
                map((res: any) => res)
            )
    }

    update(context: ProposalContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((proposal: Proposal) => this.proposalStore.upsert(proposal._id, proposal)),
                map((res: any) => res),
            )
    }

    delete(context: ProposalContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((proposal: Proposal) => this.proposalStore.remove(proposal._id)),
                map((res: any) => res)
            )
    }

    updateProposalVote(id: string, proposal: any) {
        this.proposalStore.update(id, proposal)
    }

    updateFilter(filter: string) {
        this.proposalStore.update({ filter })
    }

    updateOrder(order: string) {
        this.proposalStore.update({ order });
    }

}
