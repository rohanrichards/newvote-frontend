import { Component, OnInit, Input, Inject } from '@angular/core'
import { SwPush } from '@angular/service-worker'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { UserService } from '@app/core/http/user/user.service'
import { PushService } from '@app/core/http/push/push.service'
import { IUser } from '@app/core/models/user.model'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material'
import { DialogData } from '../confirm-dialog/confirm-dialog.component'

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

    notificationState = 'DEFAULT'
    constructor(
        private swPush: SwPush,
        private authQuery: AuthenticationQuery,
        private pushService: PushService,
        private organizationQuery: OrganizationQuery,
        private admin: AdminService,
        public dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.authQuery.select().subscribe(res => {
            // No subscriptions
            this.isSubscribed = this.checkSubscription(res)

            // check user is allowing notifications
            this.notificationState = res.subscriptionsActive;
        })

        // keep track of whether isGranted has been updated
        this.swPush.subscription.subscribe(
            res => {
                console.log(res, 'this is res on swPush')
                this.isGranted = Notification.permission === 'granted'
            },
            err => {
                console.log(err, 'this is err on swPush')
                return err
            },
        )
    }

    handleSubscription() {
        if (!this.isEnabled || Notification.permission === 'denied') {
            return false
        }

        // User can request notifications, has not denied them
        // Show a popup where they can accept or deny notifications
        // if they accept take them through the process, i.e browser request and save
        // if not, return false and do not prompt user to receive notifications
        if (Notification.permission === 'default') {
            return this.openDialog()
        }

        // User has accepted to receive Notifications in browser but has turned off notifications on their profile page in he app
        if (Notification.permission === 'granted' && this.notificationState === 'DENIED') {
            return this.admin.openSnackBar('Notifications are turned off. Visit your Profile to enable them.', 'OK');
        }
        // If a user has already been prompted & accepts notifications we can subscribe / unsubscribe them from the specific issue they
        // are requesting to sub/unsub to.
        const userId = this.authQuery.getValue()._id

        return this.pushService
            .handleIssueSubscription(userId, this.parent._id)
            .subscribe(
                res => {
                    const isSubscribed = this.checkSubscription(res);
                    if (!isSubscribed) {
                        return this.admin.openSnackBar('You have unsubscribed from this issue.', 'OK');
                    }
                    return this.admin.openSnackBar('You are now subscribed to this issue.', 'OK');
                },
                err => {
                    console.log(err, 'this is err')
                },
            )

    }

    openDialog(): void {
        const dialogRef = this.dialog.open(NotificationPopupDialog, {
            width: '300px',
            data: { organization: '', issue: this.parent },
        })

        dialogRef.afterClosed().subscribe(result => {
            // User does not want to receive notifications
            if (!result) {
                return false
            }

            // User has accepted Notifications
            const userId = this.authQuery.getValue()._id

            return this.pushService.subscribeToNotifications(
                userId,
                this.parent,
            )
        })
    }

    // Checks a users current subscriptions for the current issue
    checkSubscription(user: IUser) {
        if (!this.isEnabled || Notification.permission !== 'granted') {
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

@Component({
    selector: 'notification-popup',
    templateUrl: 'notification-popup.html',
})
export class NotificationPopupDialog {
    constructor(
        public dialogRef: MatDialogRef<NotificationPopupDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    onNoClick(): void {
        this.dialogRef.close()
    }
}

// subscribeToNotifications() {
//     const userId = this.authQuery.getValue()._id

//     // If a user has enabled notifications in browser but has disabled notifications on the app
//     // direct them to edit profile settings to enable issue notification
//     // if (!this.notificationsAllowed) {
//     //     return this.admin.openSnackBar(
//     //         'Subscriptions are disabled, visit your profile to enable them.',
//     //         'OK',
//     //     )
//     // }

//     // If user has not given permission for notifications but service worker is enabled
//     // Do normal Subscribe flow, and on response add the issue subscription

//     if (this.isGranted) {
//         return this.pushService.subscribeToNotifications(
//             userId,
//             this.parent,
//         )
//     }

//     // If user has given permission for notifications
//     // Just subscribe/unscubscribe to the issue

//     if (this.isGranted) {
//         return this.pushService
//             .handleIssueSubscription(userId, this.parent._id)
//             .subscribe(
//                 res => {
//                     console.log(res, 'this is res')
//                 },
//                 err => {
//                     console.log(err, 'this is err')
//                 },
//             )
//     }
// }
