import { Injectable } from '@angular/core'
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita'
import { Progress } from '../../models/progress.model'

export interface ProgressState extends EntityState<Progress> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'progress' })
export class ProgressStore extends EntityStore<ProgressState> {

    constructor() {
        super()
    }

}
