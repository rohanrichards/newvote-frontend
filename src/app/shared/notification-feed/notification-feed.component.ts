import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-notification-feed',
  templateUrl: './notification-feed.component.html',
  styleUrls: ['./notification-feed.component.scss']
})
export class NotificationFeedComponent implements OnInit {
  @Input() feedItems: Array<any> = ['one', 'two', 'three'];

  constructor() { }

  ngOnInit() {
  }

}
