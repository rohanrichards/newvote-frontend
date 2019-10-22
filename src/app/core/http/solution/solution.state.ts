import { Injectable } from '@angular/core'
import { StoreConfig, EntityState, EntityStore } from '@datorama/akita'
import { Solution } from '@app/core/models/solution.model'

export interface SolutionState extends EntityState<Solution> { };

@Injectable()
@StoreConfig({ name: 'solutions', idKey: '_id' })
export class SolutionStore extends EntityStore<SolutionState, Solution> {
    constructor() {
        super()
    }
}
