import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'

import { Organization, IOrganization } from '@app/core/models/organization.model'
import { handleError } from '@app/core/http/errors'
import { Socket } from 'ngx-socket-io'
import { OrganizationStore, CommunityStore } from './organization.store'
import { MetaService } from '@app/core/meta.service'

const routes = {
    list: () => '/organizations',
    view: (c: OrganizationContext) => `/organizations/${c.id}`,
    create: () => '/organizations',
    update: (c: OrganizationContext) => `/organizations/${c.id}`,
    updateOwner: (c: OrganizationContext) => `/organizations/owner/${c.id}`,
    delete: (c: OrganizationContext) => `/organizations/${c.id}`,
    patch: (c: OrganizationContext) => `/organizations/${c.id}`
}

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
        private communityStore: CommunityStore,
        private meta: MetaService
    ) {
        this._host = document.location.host
        this._subdomain = this._host.split('.')[0]

        // let params = new HttpParams();
        // const paramObject = { 'url': this._subdomain };
        // params = new HttpParams({ fromObject: paramObject });

        if (!this.$org) {
            this.$org = new BehaviorSubject({}) as BehaviorSubject<any>

            this.httpClient
                .get('/organizations/' + this._subdomain)
                .pipe(
                    catchError((err) => {
                        this.$org.next(null)
                        return handleError(err)
                    })
                ).subscribe(
                    (org: Organization) => {
                        this.communityStore.add(org)
                        this.organizationStore.update(org)
                        this._org = org
                        this.$org.next(org)
                        this.joinWebSocketRoom(org.url)
                        // Set meta tags on load
                        this.meta.setOrganizationUrl(org)
                        this.meta.updateTags({
                            title: org.name,
                            description: org.description,
                            image: org.imageUrl
                        })
                    }
                )
        }
    }

    // gets the current organization from the url
    get(): Observable<any> {
        return this.$org.asObservable()
    }

    list(context: OrganizationContext): Observable<any[]> {
        // create blank params object
        let params = new HttpParams()

        // if we have params provided in the context, replace with those
        if (context.params) {
            // context.params is assumed to have a format similar to
            // { topicId: [id], search: [search terms], ...}
            params = new HttpParams({ fromObject: context.params })
        }

        if (context.orgs) {
            params = params.append('orgs', context.orgs.join(','))
        }

        return this.httpClient
            .get(routes.list(), { params })
            .pipe(
                catchError(handleError),
                tap((res: Organization[]) => this.communityStore.add(res)),
                map((res: Array<any>) => res)
            )
    }

    view(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .get(routes.view(context))
            .pipe(
                catchError(handleError),
                tap((res: Organization) => {
                    this.organizationStore.update(res)
                    this.communityStore.add(res)
                }),
                map((res: any) => res)
            )
    }

    create(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .post(routes.create(), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: any) => this.communityStore.add(res.organization)),
                map((res: any) => res)
            )
    }

    update(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .put(routes.update(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: any) => {
                    // since there are two stores we need to check whether to update both
                    if (res._id === this._org._id) {
                        this.organizationStore.update(res.organization)
                    }

                    this.communityStore.update(res._id, res.organization)
                }),
                map((res: any) => res)
            )
    }

    setFutureOwner(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .put(routes.updateOwner(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: Organization) => {
                    this.organizationStore.update(res)
                    this.communityStore.update(res._id, res)
                }),
                map((res: any) => res)
            )
    }

    delete(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .delete(routes.delete(context))
            .pipe(
                catchError(handleError),
                tap((res: Organization) => this.communityStore.remove(res._id)),
                map((res: any) => res)
            )
    }

    patch(context: OrganizationContext): Observable<any> {
        return this.httpClient
            .patch(routes.patch(context), context.entity)
            .pipe(
                catchError(handleError),
                tap((res: IOrganization) => {
                    this.organizationStore.update({ representativeTags: res.representativeTags })
                })
            )
    }

    get org() {
        return this._org || null
    }

    get subdomain() {
        return this._subdomain
    }

    joinWebSocketRoom(room: string) {
        this.socket.emit('join org', room)
    }
}
