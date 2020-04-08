import { Injectable } from '@angular/core'
import { StoreConfig, EntityState, EntityStore } from '@datorama/akita'
import { Notification } from '@app/core/models/notification.model'

export interface NotificationState extends EntityState<Notification> {
    filter: string;
};

@Injectable()
@StoreConfig({ name: 'notifications', idKey: '_id' })
export class NotificationStore extends EntityStore<NotificationState, Notification> {
    constructor() {
        super()
    }
}
