import { Injectable } from "@angular/core";
import { QueryEntity, combineQueries } from "@datorama/akita";
import { IssueState, IssueStore } from "./issue.store";
import { Issue } from "@app/core/models/issue.model";
import { TopicQuery } from "../topic/topic.query";
import { map } from "rxjs/operators";

import { cloneDeep } from 'lodash';

@Injectable()
export class IssueQuery extends QueryEntity<IssueState, Issue> {
    constructor(protected store: IssueStore, private topicQuery: TopicQuery) {
        super(store);
    }

    getIssueWithTopic(issueId: string) {
        return combineQueries(
            [
                this.selectEntity(issueId),
                this.topicQuery.selectAll()
            ]
        )
            .pipe(
                map((results) => {
                    let [storeIssue, topics] = results;
                    const issue = cloneDeep(storeIssue);

                    if (!issue) {
                        return false;
                    }

                    if (!topics.length) {
                        return issue;
                    }

                    const populateIssueTopics = issue.topics.map((issueTopic) => {
                        return topics.find((topic) => {
                            if (typeof issueTopic === 'string') {
                                return issueTopic === topic._id;
                            }

                            return topic._id === issueTopic._id;
                        })
                    })

                    issue.topics = populateIssueTopics;
                    return issue;
                })
            )
    }
}