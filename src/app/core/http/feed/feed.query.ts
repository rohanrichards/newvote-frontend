import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { FeedStore, FeedState } from './feed.store'

@Injectable({ providedIn: 'root' })
export class FeedQuery extends QueryEntity<FeedState> {

    constructor(protected store: FeedStore) {
        super(store)
    }

}
