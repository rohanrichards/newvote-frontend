import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { INotification } from '@app/core/models/notification.model';
import { AdminService } from '@app/core/http/admin/admin.service';

@Component({
    selector: 'app-notification-feed',
    templateUrl: './notification-feed.component.html',
    styleUrls: ['./notification-feed.component.scss']
})
export class NotificationFeedComponent implements OnInit {
  @Input() feedItems: Array<any> = ['one', 'two', 'three'];
  @Input() notifications: Array<INotification> = []

  @Output() toggleEdit = new EventEmitter()

  ngOnInit() {
  }

  createDate(date: string) {
      return new Date(date)
  }

  handleNotification(notification: Notification) {
      this.toggleEdit.emit(notification)
  }
}
