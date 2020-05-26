import { Component, OnInit, Input } from '@angular/core'
import { SwPush } from '@angular/service-worker'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { UserService } from '@app/core/http/user/user.service'
import { PushService } from '@app/core/http/push/push.service'
import { IUser } from '@app/core/models/user.model'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'

@Component({
    selector: 'app-notification-bell',
    templateUrl: './notification-bell.component.html',
    styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit {
    @Input() parent: any
    notificationSubscription = false

    isEnabled = this.swPush.isEnabled
    isGranted = Notification.permission === 'granted'

    isSubscribed = false

    activeTip = 'Click to subscribe to this issue.'
    inactiveTip = 'Notifications are disabled on this device.'

    constructor(
        private swPush: SwPush,
        private authQuery: AuthenticationQuery,
        private pushService: PushService,
        private organizationQuery: OrganizationQuery,
    ) {}

    ngOnInit() {
        this.authQuery.select().subscribe(res => {
            // No subscriptions
            this.isSubscribed = this.checkSubscription(res)
        })
        //   this.swPush.subscription
        //       .subscribe((res) => {
        //           if (!res) {
        //               // no subscription
        //               this.notificationSubscription = false
        //               return
        //           }

        //           this.notificationSubscription = true
        //       },
        //       (err) => err
        //       )
    }

    handleSubscription() {
        if (this.isEnabled) {
            return this.subscribeToNotifications()
        }

        return false
    }

    subscribeToNotifications() {
        const userId = this.authQuery.getValue()._id

        // If user has not given permission for notifications but service worker is enabled
        // Do normal Subscribe flow, and on response add the issue subscription

        if (this.isEnabled && !this.isGranted) {
            this.pushService.subscribeToNotifications(userId, this.parent)
        }

        // If user has given permission for notifications
        // Just subscribe/unscubscribe to the issue

        if (this.isEnabled && this.isGranted) {
            this.pushService
                .handleIssueSubscription(userId, this.parent._id)
                .subscribe(
                    res => {
                        console.log(res, 'this is res')
                    },
                    err => {
                        console.log(err, 'this is err')
                    },
                )
        }

    }

    checkSubscription(user: IUser) {
        if (!this.isEnabled) {
            return false
        }

        const { _id: organizationId } = this.organizationQuery.getValue()
        const { subscriptions } = user

        if (!subscriptions[organizationId]) return false
        // check if issue._id exists inside of the subscriptions object
        const { issues = [] } = subscriptions[organizationId]

        if (!issues.length) return false

        const issueExists = issues.includes(this.parent._id)

        if (!issueExists) return false

        return true
    }
}
