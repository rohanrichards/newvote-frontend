import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { RepState, RepStore } from './rep.store'

import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { Rep } from '@app/core/models/rep.model'

@Injectable()
export class SuggestionQuery extends QueryEntity<RepState, Rep> {
    Reps$ = this.selectAll()

    constructor(
        protected store: RepStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }
}
