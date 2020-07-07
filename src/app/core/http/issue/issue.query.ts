import { Injectable } from '@angular/core'
import { QueryEntity, combineQueries } from '@datorama/akita'
import { IssueState, IssueStore } from './issue.store'
import { Issue } from '@app/core/models/issue.model'
import { TopicQuery } from '../topic/topic.query'
import { map } from 'rxjs/operators'

import { cloneDeep } from 'lodash'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Injectable()
export class IssueQuery extends QueryEntity<IssueState, Issue> {
    issues$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true
            }

            return !entity.softDeleted
        }
    })

    constructor(
        protected store: IssueStore,
        private topicQuery: TopicQuery,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    getIssueWithTopic(issueId: string) {
        const isObjectId = issueId.match(/^[0-9a-fA-F]{24}$/)

        return combineQueries(
            [
                this.selectAll({
                    filterBy: (entity: Issue) => isObjectId ? entity._id === issueId : entity.slug === issueId
                }),
                this.topicQuery.selectAll()
            ]
        )
            .pipe(
                map((results) => {
                    const [storeIssue, topics] = results
                    const issue = cloneDeep(storeIssue[0])

                    if (!issue) {
                        return false
                    }

                    if (!topics.length) {
                        return issue
                    }

                    const populateIssueTopics = issue.topics.map((issueTopic) => {
                        return topics.find((topic) => {
                            if (typeof issueTopic === 'string') {
                                return issueTopic === topic._id
                            }

                            return topic._id === issueTopic._id
                        })
                    })

                    issue.topics = populateIssueTopics
                    return issue
                })
            )
    }

    getIssuesByOrganizations(organizations: any[]) {
        return this.issues$
            .pipe(
                map((issues: any[]) => {
                    const issuesObj = {}
                    organizations.forEach((organization) => {
                        if (!issuesObj[organization]) {
                            issuesObj[organization] = {
                                issues: [],
                            }
                        }    
                        return organization
                    })

                    issues.forEach((issue) => {
                        if (issuesObj[issue.organizations._id]) {
                            issuesObj[issue.organizations._id].issues.push(issue)
                        }

                        return issue
                    })
                    
                    return issuesObj
                })
            )
     }   
}
