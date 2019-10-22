import { QueryEntity } from '@datorama/akita'
import { TopicState, TopicStore } from './topic.store'
import { Topic } from '@app/core/models/topic.model'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

export class TopicQuery extends QueryEntity<TopicState, Topic> {
    // topics$ = this.selectAll({
    //     filterBy: (entity) => {
    //         if (this.auth.isOwner()) {
    //             return true;
    //         }

    //         return !entity.softDeleted;
    //     }
    // })

    constructor(
        protected store: TopicStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }
}
