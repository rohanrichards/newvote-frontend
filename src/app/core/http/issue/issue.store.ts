import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Issue } from '@app/core/models/issue.model'
import { Injectable } from '@angular/core'

export interface IssueState extends EntityState<Issue> { };

const initialState = {
    filter: 'SHOW_ALL',
    sort: 'ASCENDING'
}

@Injectable()
@StoreConfig({ name: 'issues', idKey: '_id' })
export class IssueStore extends EntityStore<IssueState, Issue> {
    constructor() {
        super(initialState)
    }
}
