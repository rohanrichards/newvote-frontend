import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { IIssue, Issue } from '@app/core/models/issue.model'
import { handleError } from '@app/core/http/errors'
import { IssueStore } from './issue.store'

const routes = {
    list: () => '/issues',
    view: (c: IssueContext) => `/issues/${c.id}`,
    create: () => '/issues',
    update: (c: IssueContext) => `/issues/${c.id}`,
    delete: (c: IssueContext) => `/issues/${c.id}`
}

export interface IssueContext {
    // The issue's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: IIssue; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class IssueService {

    constructor(
        private httpClient: HttpClient,
        private issueStore: IssueStore
    ) { }

    list(context: IssueContext): Observable<any[]> {
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
                catchError(handleError),
                tap((issues: Issue[]) => this.issueStore.add(issues)),
                map((res: Array<any>) => res),
            )
    }

    view(context: IssueContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((issue: Issue) => this.issueStore.add(issue)),
                map((res: any) => res),
            )
    }

    create(context: IssueContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((issue: Issue) => this.issueStore.add(issue)),
                map((res: any) => res),
            )
    }

    update(context: IssueContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((issue: Issue) => this.issueStore.upsert(issue._id, issue)),
                map((res: any) => res),
            )
    }

    delete(context: IssueContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((issue: Issue) => this.issueStore.remove(issue._id)),
                map((res: any) => res)
            )
    }

    updateFilter(filter: string) {
        this.issueStore.update({ filter })
    }

    updateOrder(order: string) {
        this.issueStore.update({ order });
    }

}
