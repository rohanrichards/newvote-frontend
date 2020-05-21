import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'
import { handleError } from '@app/core/http/errors'
import { INotification, Notification } from '@app/core/models/notification.model'
import { environment } from '@env/environment'
import { AdminService } from '../admin/admin.service'
import { UserService } from '../user/user.service'
import { SwPush } from '@angular/service-worker'

@Injectable()
export class PushService {

    constructor(
        private admin: AdminService,
        private userService: UserService,
        private swPush: SwPush
    ) { }

    subscribeToNotifications(userId: string) {
        this.swPush.requestSubscription({
            serverPublicKey: environment.vapidPublicKey
        })
            .then((sub: any) => {
                this.createPushNotification(userId, sub)
            })
            .catch((err) => {
                this.admin.openSnackBar('Browser does not support push notifications.', 'OK')
                return err
            })
    }

    createPushNotification(id: string, subscription: PushSubscription) {
        this.userService.addPushSubscriber({ id, subscription })
            .subscribe(
                (res) => {
                    this.admin.openSnackBar('Successfully subscribed to Notifications.', 'OK')
                },
                (err) => {
                    this.admin.openSnackBar('Unable to subscribe to Notifications.', 'OK')
                    return err
                }
            )
    }
}
