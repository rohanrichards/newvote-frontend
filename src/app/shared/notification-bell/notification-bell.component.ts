import { Component, OnInit, Input, Inject } from '@angular/core'
import { SwPush } from '@angular/service-worker'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { AdminService } from '@app/core/http/admin/admin.service'
import { UserService } from '@app/core/http/user/user.service'
import { PushService } from '@app/core/http/push/push.service'
import { IUser } from '@app/core/models/user.model'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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

    constructor(
        private swPush: SwPush,
        private authQuery: AuthenticationQuery,
        private pushService: PushService,
        private userService: UserService,
        private organizationQuery: OrganizationQuery,
        private admin: AdminService,
        public dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.authQuery.select().subscribe(res => {
            // No subscriptions
            this.isSubscribed = this.checkSubscription(res)
        })

        // keep track of whether isGranted has been updated
        this.swPush.subscription.subscribe(
            res => {
                this.isGranted = Notification.permission === 'granted'
            },
            err => {
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

        // If a user has already been prompted & accepts notifications we can subscribe / unsubscribe them from the specific issue they
        // are requesting to sub/unsub to.
        const userId = this.authQuery.getValue()._id

        return this.userService
            .handleIssueSubscription({ id: userId }, this.parent._id)
            .subscribe(
                res => {
                    const isSubscribed = this.checkSubscription(res)
                    if (!isSubscribed) {
                        return this.admin.openSnackBar('You have unsubscribed from this issue.', 'OK');
                    }
                    return this.admin.openSnackBar('You are now subscribed to this issue.', 'OK');
                },
                err => err,
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
                .then(data => {
                    this.admin.openSnackBar(
                        'Successfully subscribed to Notifications.',
                        'OK',
                    )
                })
                .catch(err => {
                    this.admin.openSnackBar(
                        'Unable to subscribe to Notifications.',
                        'OK',
                    )
                    return err
                })
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
