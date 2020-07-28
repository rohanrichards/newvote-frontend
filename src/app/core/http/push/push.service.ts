import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of, forkJoin } from 'rxjs'
import { map, catchError, tap } from 'rxjs/operators'
import { handleError } from '@app/core/http/errors'
import {
    INotification,
    Notification,
} from '@app/core/models/notification.model'
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
        private router: Router,
    ) {}

    subscribeToNotifications(userId: string, parentId?: string) {
        return this.swPush
            .requestSubscription({
                serverPublicKey: environment.vapidPublicKey,
            })
            .then((subscription: any) => {
                console.log(subscription, 'this is subscription')
                if (!subscription) {
                    throw new Error('No Subscription');
                }
                // If no parent Id then we are just saving the subscription object
                if (!parentId) {
                    return this.userService
                        .addPushSubscriber({
                            id: userId,
                            subscription,
                        })
                        .toPromise()
                }

                return forkJoin({
                    user: this.userService.addPushSubscriber({
                        id: userId,
                        subscription,
                    }),
                    issueSubscription: this.userService.handleIssueSubscription(
                        { id: userId },
                        parentId,
                    ),
                }).toPromise()
            })
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
