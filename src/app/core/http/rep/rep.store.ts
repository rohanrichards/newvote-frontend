import { Injectable } from '@angular/core'
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Rep } from '@app/core/models/rep.model'

export interface RepState extends EntityState<Rep> { };

@Injectable()
@StoreConfig({ 
    name: 'reps',
    idKey: '_id',
    cache: {
        ttl: 3600000
    }
})
export class RepStore extends EntityStore<RepState, Rep> {
    constructor() {
        super()
    }
}
