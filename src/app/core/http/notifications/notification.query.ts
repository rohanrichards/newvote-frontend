import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita';
import { NotificationState, NotificationStore } from './notification.store';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { map } from 'rxjs/operators';
import { INotification, Notification } from '@app/core/models/notification.model';

@Injectable()
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
    constructor(
        protected store: NotificationStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    getNotifications(parentId: string) {
        return this.selectAll({
            filterBy: (entity: any) => entity.parent === parentId
        })
    }
}
