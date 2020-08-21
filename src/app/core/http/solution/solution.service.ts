import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { ISolution, Solution } from '@app/core/models/solution.model'
import { handleError } from '@app/core/http/errors'
import { VoteService } from '../vote/vote.service'
import { SolutionStore } from './solution.store'
import { VoteMetaData, UserVoteData } from '../vote/vote.store'

const routes = {
    list: () => '/solutions',
    view: (c: SolutionContext) => `/solutions/${c.id}`,
    create: () => '/solutions',
    update: (c: SolutionContext) => `/solutions/${c.id}`,
    delete: (c: SolutionContext) => `/solutions/${c.id}`
}

export interface SolutionContext {
    // The solution's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: ISolution; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

interface SolutionListResponse {
    solutions: Solution[];
    voteMetaData: VoteMetaData[];
    userVoteData?: UserVoteData[];
}

@Injectable()
export class SolutionService {

    constructor(
        private httpClient: HttpClient,
        private voteService: VoteService,
        private solutionStore: SolutionStore
    ) { }

    list(context: SolutionContext): Observable<any[]> {
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
                tap((data: any) => {
                    const { solutions, voteMetaData, userVoteData } = data
                    this.voteService.addMetaDataVotes(voteMetaData)
                    this.solutionStore.add(solutions)
                    if (userVoteData) {
                        this.voteService.addUserVotes(userVoteData)
                    }
                }),
                map((res: Array<any>) => res)
            )
    }

    view(context: SolutionContext): Observable<any> {

        let params = new HttpParams()

        if (context.params) {
            params = new HttpParams({ fromObject: context.params })
        }

        return this.httpClient
            .get(routes.view(context), { params })
            .pipe(
                catchError(handleError),
                tap((res: any) => {
                    const { solutions, voteMetaData, userVoteData } = res
                    this.voteService.addMetaDataVotes(voteMetaData)
                    this.solutionStore.add(solutions)
                    if (userVoteData) {
                        this.voteService.addUserVotes(userVoteData)
                    }
                }),
                map((res: any) => res)
            )
    }

    create(context: SolutionContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((solution: Solution) => this.solutionStore.add(solution)),
                map((res: any) => res)
            )
    }

    update(context: SolutionContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((solution: Solution) => this.solutionStore.update(solution._id, solution)),
                map((res: any) => res)
            )
    }

    delete(context: SolutionContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((solution: Solution) => this.solutionStore.remove(solution._id)),
                map((res: any) => res)
            )
    }

    updateSolutionVote(id: string, solution: any) {
        this.solutionStore.update(id, solution)
    }

    updateFilter(filter: string) {
        this.solutionStore.update({ filter })
    }

    updateOrder(order: string) {
        this.solutionStore.update({ order })
    }
}
