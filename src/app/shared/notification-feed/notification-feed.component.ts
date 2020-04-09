import { Component, OnInit, Input } from '@angular/core';
import { INotification } from '@app/core/models/notification.model';

@Component({
    selector: 'app-notification-feed',
    templateUrl: './notification-feed.component.html',
    styleUrls: ['./notification-feed.component.scss']
})
export class NotificationFeedComponent implements OnInit {
  @Input() feedItems: Array<any> = ['one', 'two', 'three'];
  @Input() notifications: Array<INotification> = []

  constructor() { }

  ngOnInit() {
  }

  createDate(date: string) {
      return new Date(date)
  }

}
