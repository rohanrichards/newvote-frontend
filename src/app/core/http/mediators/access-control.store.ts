import { Injectable } from '@angular/core';
import { RepStore } from '../rep/rep.store';
import { AuthenticationStore } from '@app/core/authentication/authentication.store';
import { OrganizationStore } from '../organization/organization.store';

@Injectable()
export class AccessControlStore {
    constructor(public rep: RepStore, public auth: AuthenticationStore, public org: OrganizationStore) { }
}
