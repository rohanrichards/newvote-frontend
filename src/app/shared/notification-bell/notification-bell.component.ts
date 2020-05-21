import { Component, OnInit, Input } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { AdminService } from '@app/core/http/admin/admin.service';
import { UserService } from '@app/core/http/user/user.service';
import { PushService } from '@app/core/http/push/push.service';

@Component({
    selector: 'app-notification-bell',
    templateUrl: './notification-bell.component.html',
    styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit {
  @Input() parent: any;
  notificationSubscription = false

  isEnabled = this.swPush.isEnabled;
  isGranted = Notification.permission === 'granted';

  isSubscribed = false

  constructor(
    private swPush: SwPush,
    private authQuery: AuthenticationQuery,
    private pushService: PushService
  ) { }

  ngOnInit() {

    this.authQuery.select()
        .subscribe(
            (res) => {
                // No subscriptions 
                if (!res || !res.subscriptions) {
                    this.isSubscribed = false
                }

                const { subscriptions } = res
                const { hostname } = window.location
                // separate the current hostname into subdomain and main site
                const [url, ...rest] = hostname.split('.')

                // check if issue._id exists inside of the subscriptions object
                if (subscriptions[url] && subscriptions[url].issues && subscriptions[url].issues.includes(this.parent._id)) {
                    this.isSubscribed = true
                }
            }
        )
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

    subscribeToNotifications() {
        const userId = this.authQuery.getValue()._id
        this.pushService.subscribeToNotifications(userId)
    }
 
    handleSubscription() {
      if (this.isEnabled) {
          return this.subscribeToNotifications()
      }
      return false
    }

    
}
