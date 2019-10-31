import { Injectable } from '@angular/core'
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita'
import { Feed } from '../../models/feed.model'

export interface FeedState extends EntityState<Feed> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'feed', idKey: '_id' })
export class FeedStore extends EntityStore<FeedState> {

    constructor() {
        super()
    }

}
