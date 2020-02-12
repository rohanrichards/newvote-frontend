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

  @Output() restore = new EventEmitter();
  @Output() softDelete = new EventEmitter();
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

  onSoftDelete(item: any, event: any) {
      event.stopPropagation()
      this.softDelete.emit(item)
  }

  onRestore(item: any, event: any) {
      event.stopPropagation()
      this.restore.emit(item)
  }

}
