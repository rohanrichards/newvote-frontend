import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'
import { handleError } from '@app/core/http/errors'
import { RepStore } from './rep.store'
import { IRep } from '@app/core/models/rep.model'

const routes = {
    list: () => '/proposals',
    view: (c: RepContext) => `/reps/${c.id}`,
    create: () => '/proposals',
    update: (c: RepContext) => `/reps/${c.id}`,
    delete: (c: RepContext) => `/reps/${c.id}`
}

export interface RepContext {
    // The proposal's category: 'dev', 'explicit'...
    orgs?: Array<string>; // users organisations
    id?: string; // id of object to find/modify
    entity?: IRep; // the object being created or edited
    params?: any;
    forceUpdate?: boolean;
}

@Injectable()
export class ProposalService {

    constructor(
        private httpClient: HttpClient,
        private store: RepStore
    ) { }

}
