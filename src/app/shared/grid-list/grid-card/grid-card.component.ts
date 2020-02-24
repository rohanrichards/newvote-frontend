import { Component, Input } from '@angular/core'
import { optimizeImage } from '../../helpers/cloudinary'
import { Router } from '@angular/router';

@Component({
    selector: 'app-grid-card',
    templateUrl: './grid-card.component.html',
    styleUrls: ['./grid-card.component.scss']
})
export class GridCardComponent {

  @Input() itemLimit: number;
  @Input() path: string;
  @Input() model: string;
  @Input() item: any;
  @Input() titleCard: boolean;
  @Input() centerTitle: boolean;
  @Input() repCard: boolean;
  @Input() isCard: boolean;
  @Input() horizontalCard: boolean;

  handleImageUrl = optimizeImage;

  constructor(private router: Router) { }

  handleUrl(item: any) {

      if (this.model !== 'Organization') {
          return this.router.navigate([`/${this.path}/${item.slug || item._id}`])
      }

      const { hostname } = window.location

      // separate the current hostname into subdomain and main site
      const splitHostname = hostname.split('.')
      splitHostname[0] = item.url

      const newHostName = splitHostname.join('.')
      window.location.href = `http://${newHostName}:${window.location.port}`
  }
}
