import { IssueStore } from "../issue/issue.store";
import { TopicStore } from "../topic/topic.store";
import { Injectable } from "@angular/core";

@Injectable()
export class AllEntityStore {
    constructor(public Topic: TopicStore, public Issue: IssueStore) { }
}
