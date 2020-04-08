import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita';
import { NotificationState, NotificationStore } from './notification.store';

@Injectable()
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
    constructor(
        protected store: NotificationStore,
    ) {
        super(store)
    }
}
