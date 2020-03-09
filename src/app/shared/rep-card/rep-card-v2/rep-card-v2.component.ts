import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IRep } from '@app/core/models/rep.model';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { optimizeImage } from '../../helpers/cloudinary';

@Component({
  selector: 'app-rep-card-v2',
  templateUrl: './rep-card-v2.component.html',
  styleUrls: ['./rep-card-v2.component.scss']
})
export class RepCardV2Component implements OnInit {
  @Input() rep: IRep
  @Input() path: string;
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
