import { QueryEntity } from "@datorama/akita";
import { TopicState, TopicStore } from "./topic.store";
import { Topic } from "@app/core/models/topic.model";


export class TopicQuery extends QueryEntity<TopicState, Topic> {
    constructor(protected store: TopicStore) {
        super(store);
    }
}