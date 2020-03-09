import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { optimizeImage } from '../helpers/cloudinary';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

@Component({
    selector: 'app-rep-card',
    templateUrl: './rep-card.component.html',
    styleUrls: ['./rep-card.component.scss']
})
export class RepCardComponent implements OnInit {
  @Input() path: string;
  @Input() item: any;
  @Input() repName: string;
  @Input() tags: any[];

  @Output() delete = new EventEmitter();

  handleImageUrl = optimizeImage

  DEFAULT_IMAGE = 'assets/logo-no-text.png'
  constructor(public auth: AuthenticationQuery) { }

  ngOnInit() {
  }

  onDelete(item: any, event: any) {
      event.stopPropagation()
      this.delete.emit(item)
  }

  filterTags(userTags: any, communityTags: any = this.tags) {
      if (!userTags.length) return []
      return userTags.filter((tag: any) => {
          return communityTags.find((item: any) => {
              return item.name === tag
          })
      })
  }

}
