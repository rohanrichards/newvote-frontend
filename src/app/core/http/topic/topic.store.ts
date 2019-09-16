import { EntityState, StoreConfig, EntityStore } from "@datorama/akita";
import { Topic } from "@app/core/models/topic.model";
import { Injectable } from "@angular/core";

export interface TopicState extends EntityState<Topic> { };

Injectable()
@StoreConfig({ name: 'topics', idKey: '_id' })
export class TopicStore extends EntityStore<TopicState, Topic> {
    constructor() {
        super();
    }
}