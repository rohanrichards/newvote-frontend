import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-social-bar',
  templateUrl: './skeleton-social-bar.component.html',
  styleUrls: ['./skeleton-social-bar.component.scss']
})
export class SkeletonSocialBarComponent implements OnInit {

  @Input() buttons: Number = 6;

  constructor() { }

  ngOnInit() {
  }

  createButtonRange() {
    var items: number[] = [];
    for (let i = 1; i <= this.buttons; i++) {
      items.push(i);
    }

    return items;
  
  }
}
