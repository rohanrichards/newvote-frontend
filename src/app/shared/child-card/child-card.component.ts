import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { IIssue } from '@app/core/models/issue.model';

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
  handleImageUrl = optimizeImage

  constructor() { }

  ngOnInit() {
  }

  onVote(event: any) {
      this.vote.emit(event)
  }
}
