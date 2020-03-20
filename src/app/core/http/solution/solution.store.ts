import { Injectable } from '@angular/core'
import { StoreConfig, EntityState, EntityStore } from '@datorama/akita'
import { Solution } from '@app/core/models/solution.model'

export interface SolutionState extends EntityState<Solution> {
    filter: string;
};

const initialState = {
    filter: 'SHOW_ALL',
    sort: 'ASCENDING'
}

@Injectable()
@StoreConfig({ 
    name: 'solutions',
    idKey: '_id',
    cache: {
        ttl: 3600000
    }
})
export class SolutionStore extends EntityStore<SolutionState, Solution> {
    constructor() {
        super(initialState)
    }
}
