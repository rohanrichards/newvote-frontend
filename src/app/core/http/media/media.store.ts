import { EntityState, StoreConfig, EntityStore } from '@datorama/akita'
import { Media } from '@app/core/models/media.model'
import { Injectable } from '@angular/core'

export interface MediaState extends EntityState<Media> { }

@Injectable()
@StoreConfig({ name: 'media', idKey: '_id' })
export class MediaStore extends EntityStore<MediaState, Media> {
    constructor() {
        super()
    }
}
