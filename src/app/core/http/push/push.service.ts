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
import { Router } from '@angular/router'

@Injectable()
export class PushService {

    constructor(
        private admin: AdminService,
        private userService: UserService,
        private swPush: SwPush,
        private router: Router
    ) {
        this.swPush.notificationClicks.subscribe((arg) => {
            console.log(arg, 'this is arg on notification click');
            const { notification: { data }} = arg;

            this.handleUrl(data)
        })
    }

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

    private handleUrl(item: any) {
        const { organization: organizationUrl, url: slug } = item
        const { hostname } = window.location
        const [currentUrl, ...rest] = hostname.split('.')

        // same organization just redirect to issue slug
        if (currentUrl === organizationUrl) {
            return this.router.navigate(['issues', slug])
        }

        const newHostName = organizationUrl + '.' + rest.join('.')
        const notificationUrlPath = `issues/${slug}`

        window.location.href = `http://${newHostName}:${window.location.port}/${notificationUrlPath}`
    }
}
