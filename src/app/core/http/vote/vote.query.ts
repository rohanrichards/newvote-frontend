import { QueryEntity } from '@datorama/akita'
import { VoteMetaDataState, VoteStore, VoteMetaData } from './vote.store'
import { Injectable } from '@angular/core'

@Injectable()
export class VotesQuery extends QueryEntity<VoteMetaDataState, VoteMetaData> {
    constructor(protected store: VoteStore) {
        super(store)
    }

    getVote(id: any) {
        return this.selectAll({
            filterBy: (vote: any) => vote._id === id
        })
    }
}
