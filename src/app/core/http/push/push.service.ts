import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of, forkJoin } from 'rxjs'
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

    subscribeToNotifications(userId: string, parentId?: string) {
        this.swPush.requestSubscription({
            serverPublicKey: environment.vapidPublicKey
        })
            .then((subscription: any) => {
                // If no parent Id then we are just saving the subscription object
                if (!parentId) {
                    return this.createPushNotification(userId, subscription)
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

                return forkJoin({
                    user: this.createPushNotification(userId, subscription),
                    issueSubscription: this.handleIssueSubscription(userId, parentId)
                })
                    .subscribe(
                        (res) => {
                            this.admin.openSnackBar('Successfully subscribed to Notifications.', 'OK')
                        },
                        (err) => {
                            this.admin.openSnackBar('Unable to subscribe to Notifications.', 'OK')
                            return err
                        }
                    )
            })
            .catch((err) => {
                this.admin.openSnackBar('Browser does not support push notifications.', 'OK')
                return err
            })
    }

    createPushNotification(id: string, subscription: PushSubscription) {
        return this.userService.addPushSubscriber({ id, subscription })
    }

    handleIssueSubscription(id: string, parentId: string) {
        return this.userService.handleIssueSubscription({ id: id }, parentId)
    }
}
