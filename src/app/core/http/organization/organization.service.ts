import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscriber, of, BehaviorSubject } from 'rxjs';
import { map, finalize, catchError, tap } from 'rxjs/operators';

import { Organization } from '@app/core/models/organization.model';
import { handleError } from '@app/core/http/errors';
import { Socket } from 'ngx-socket-io';
import { OrganizationStore, CommunityStore } from './organization.store';

const routes = {
    list: (c: OrganizationContext) => `/organizations`,
    view: (c: OrganizationContext) => `/organizations/${c.id}`,
    create: (c: OrganizationContext) => `/organizations`,
    update: (c: OrganizationContext) => `/organizations/${c.id}`,
    updateOwner: (c: OrganizationContext) => `/organizations/owner/${c.id}`,
    delete: (c: OrganizationContext) => `/organizations/${c.id}`
};

export interface OrganizationContext {
    // The solution's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: Organization; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class OrganizationService {

    private _host: string;
    private _subdomain: string;
    private _org: Organization;
    private $org: BehaviorSubject<any>;

    constructor(
        private socket: Socket,
        private httpClient: HttpClient,
        private organizationStore: OrganizationStore,
        private communityStore: CommunityStore
    ) {
        this._host = document.location.host;
        this._subdomain = this._host.split('.')[0];

        // let params = new HttpParams();
        // const paramObject = { 'url': this._subdomain };
        // params = new HttpParams({ fromObject: paramObject });

        if (!this.$org) {
            this.$org = <BehaviorSubject<any>>new BehaviorSubject({});

            this.httpClient
                .get('/organizations/' + this._subdomain)
                .pipe(
                    catchError(handleError)
                ).subscribe(
                    (org: Organization) => {
                        this.communityStore.add(org);
                        this.organizationStore.update(org);
                        this._org = org;
                        this.$org.next(org);
                        this.joinWebSocketRoom(org.url)
                    },
                    (err) => {
                        this.$org.next(null);
                    }
                );
        }
    }

    // gets the current organization from the url
    get(): Observable<any> {
        return this.$org.asObservable();
    }

    list(context: OrganizationContext): Observable<any[]> {
        // create blank params object
        let params = new HttpParams();

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params });
        }

        return this.httpClient
            .get(routes.list(context), { params })
            .pipe(
                tap((res: Organization[]) => this.communityStore.add(res)),
                map((res: Array<any>) => res),
                catchError(handleError)
            );
    }

    view(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                tap((res: Organization) => {
                    this.organizationStore.update(res);
                    this.communityStore.add(res)
                }),
                map((res: any) => res),
                catchError(handleError)
            );
    }

    create(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .post(routes.create(context), context.entity)
            .pipe(
                tap((res: Organization) => this.communityStore.add(res)),
                map((res: any) => res),
                catchError(handleError)
            );
    }

    update(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                tap((res: Organization) => {
                    // since there are two stores we need to check whether to update both
                    if (res._id === this._org._id) {
                        this.organizationStore.update(res);
                    }

                    this.communityStore.update(res._id, res)
                }),
                map((res: any) => res),
                catchError(handleError)
            );
    }

    setFutureOwner(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .put(routes.updateOwner(context), context.entity)
            .pipe(
                tap((res: Organization) => {
                    this.organizationStore.update(res)
                    this.communityStore.update(res._id, res);
                }),
                map((res: any) => res),
                catchError(handleError)
            );
    }

    delete(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                tap((res: Organization) => this.communityStore.remove(res._id)),
                map((res: any) => res),
                catchError(handleError)
            );
    }

    get org() {
        return this._org || null;
    }

    get subdomain() {
        return this._subdomain;
    }

    joinWebSocketRoom(room: string) {
        this.socket.emit('join org', room)
    }
}
