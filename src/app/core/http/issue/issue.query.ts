import { Injectable } from "@angular/core";
import { QueryEntity, combineQueries } from "@datorama/akita";
import { IssueState, IssueStore } from "./issue.store";
import { Issue } from "@app/core/models/issue.model";
import { TopicQuery } from "../topic/topic.query";
import { map } from "rxjs/operators";

import { cloneDeep } from 'lodash';
import { AuthenticationQuery } from "@app/core/authentication/authentication.query";

@Injectable()
export class IssueQuery extends QueryEntity<IssueState, Issue> {
    issues$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isOwner()) {
                return true;
            }

            return !entity.softDeleted;
        }
    })


    constructor(protected store: IssueStore, private topicQuery: TopicQuery, private auth: AuthenticationQuery) {
        super(store);
    }

    getIssueWithTopic(issueId: string, slug?: boolean) {

        let issueSearch;

        if (slug) {
            issueSearch = this.selectAll({
                filterBy: (entity: Issue) => entity.slug === issueId
            })
        } else {
            issueSearch = this.selectEntity(issueId);
        }

        return combineQueries(
            [
                issueSearch,
                this.topicQuery.selectAll()
            ]
        )
            .pipe(
                map((results) => {
                    let [storeIssue, topics] = results;
                    let issue;

                    if (slug) {
                        issue = cloneDeep(storeIssue[0]);
                    } else {
                        issue = cloneDeep(storeIssue);
                    }

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