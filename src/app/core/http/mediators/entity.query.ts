import { Injectable } from '@angular/core'
import { TopicQuery } from '../topic/topic.query'
import { IssueQuery } from '../issue/issue.query'
import { combineQueries } from '@datorama/akita'
import { map } from 'rxjs/operators'
import { ITopic } from '@app/core/models/topic.model'
import { Issue, IIssue } from '@app/core/models/issue.model'

@Injectable()

export class AllEntityQuery {
    constructor(public Topics: TopicQuery, public Issues: IssueQuery) { }

    populateTopics() {
        return combineQueries(
            [
                this.Topics.selectAll({}),
                this.Issues.issues$
            ]
        )
            .pipe(
                map((results) => {
                    console.log(results, 'this is results')

                    // On first load of the topicStore values, issues is an empty array
                    // when populateTopics reaches the component, the issues array is populated with
                    // issues.
                    // If an issue is removed, the issues array on the Topic Object is unchanged
                    // every time the store is changed, need to reset the issues array to empty in order
                    // to clear out / update old issues
                    const [akitaTopics, issues] = results
                    const topics = akitaTopics.slice().map((item: ITopic) => {
                        return Object.assign({}, {
                            ...item,
                            issues: []
                        })
                    })
                    const orphanedIssues = [] as IIssue[]
                    if (!issues.length) {
                        return false
                    }

                    if (!topics.length) {
                        return false
                    }

                    issues.slice().forEach((issue) => {
                        if (!issue.topics.length) {
                            return orphanedIssues.push(issue)
                        }
                        return issue.topics.forEach((topic: ITopic) => {
                            const topicIndex = topics.findIndex((item) => {
                                // when a new issue is added it's topics array will be an
                                // array of unpopulated object_id's so we need to compare
                                // an array item of string against an object with an objectid
                                if (typeof topic === 'string') {
                                    return item._id === topic
                                }
                                return item._id === topic._id
                            })

                            if (topicIndex === -1) return false

                            if (!topics[topicIndex].issues) {
                                topics[topicIndex] = Object.assign({}, {
                                    ...topics[topicIndex],
                                    issues: []
                                })
                            }
                            // check whether issue exists on the topics issue list
                            // otherwise, akita will return an array with duplicates
                            const oldTopic = topics[topicIndex]
                            const issueExists = oldTopic.issues.some((item) => {
                                if (item._id === issue._id) return true
                                return false
                            })

                            if (issueExists) return false
                            return topics[topicIndex].issues.push(issue)
                        })
                    })

                    return {
                        topics,
                        orphanedIssues
                    }
                })
            )
    }
}
