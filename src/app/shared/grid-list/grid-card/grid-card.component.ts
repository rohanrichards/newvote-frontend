import { Component, Input } from '@angular/core'
import { optimizeImage } from '../../helpers/cloudinary'
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private router: Router, private route: ActivatedRoute) { }

  handleUrl(item: any) {
      if (this.model !== 'Organization') {
        const link = this.path ? [this.path, `${item.slug || item._id}`]
            : [`${item.slug || item._id}`]
        const options = { relativeTo: this.route } 

        return this.router.navigate(link, options)
      }

    return this.router.navigate([`/communities/${item.slug || item._id}`])
  }
}
