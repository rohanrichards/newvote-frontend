import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Suggestion } from '@app/core/models/suggestion.model'
import { Injectable } from '@angular/core'

export interface SuggestionState extends EntityState<Suggestion> { };

const initialState = {
    filter: 'SHOW_ALL',
    sort: 'ASCENDING'
}

@Injectable()
@StoreConfig({ name: 'suggestions', idKey: '_id' })
export class SuggestionStore extends EntityStore<SuggestionState> {
    constructor() {
        super(initialState)
    }
}
