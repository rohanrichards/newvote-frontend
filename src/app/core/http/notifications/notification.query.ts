import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita';
import { NotificationState, NotificationStore } from './notification.store';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { map } from 'rxjs/operators';
import { INotification, Notification } from '@app/core/models/notification.model';

@Injectable()
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
    notifications$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true
            }

            return !entity.softDeleted
        }
    })

    constructor(
        protected store: NotificationStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    getNotifications(parentId: string) {
        return this.notifications$
            .pipe(
                map((items) => {
                    return items.filter((entity: any) => {
                        return entity.parent === parentId
                    })
                })
            )
    }
}
