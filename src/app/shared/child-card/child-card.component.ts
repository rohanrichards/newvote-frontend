import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { optimizeChild } from '@app/shared/helpers/cloudinary'

@Component({
    selector: 'app-child-card',
    templateUrl: './child-card.component.html',
    styleUrls: ['./child-card.component.scss']
})
export class ChildCardComponent implements OnInit {

  @Input() path: string;
  @Input() item: any;
  @Input() repCard: boolean;

  @Output() vote = new EventEmitter();
  handleImageUrl = optimizeChild

  constructor() { }

  ngOnInit() {
  }

  onVote(event: any) {
      this.vote.emit(event)
  }
}
