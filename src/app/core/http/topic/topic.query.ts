import { QueryEntity } from '@datorama/akita'
import { TopicState, TopicStore } from './topic.store'
import { Topic } from '@app/core/models/topic.model'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { Injectable } from "@angular/core";

@Injectable()
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

    getTopic(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)

        return this.selectAll({
            filterBy: (entity) => isObjectId ? entity._id === id : entity.slug === id
        })
    }

    getTopicWithSlug(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        return this.selectAll({
            filterBy: (entity: Topic) => isObjectId ? entity._id === id : entity.slug === id
        })
    }
}
