import { Injectable } from '@angular/core'
import { StoreConfig, Store } from '@datorama/akita'
import { IUser } from '../models/user.model'

export function createInitialState(): IUser {
    return {
        _id: '',
        firstName: '',
        lastName: '',
        displayName: '',
        email: '',
        postalCode: '',
        username: '',
        mobileNumber: '',
        verified: false,
        profileImageURL: '',
        roles: [],
        completedTour: false,
        organizations: [],
        subscriptionsActive: 'DEFAULT'
    }
}

@Injectable()
@StoreConfig({
    name: 'auth',
    resettable: true,
    cache: {
        ttl: 3600000,
    },
})
export class AuthenticationStore extends Store<IUser> {
    constructor() {
        super(createInitialState())
    }
}
