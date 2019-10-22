import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-wide-card',
    templateUrl: './skeleton-wide-card.component.html',
    styleUrls: ['./skeleton-wide-card.component.scss']
})
export class SkeletonWideCardComponent {

    @Input() showImage: boolean;
    @Input() showContent: boolean;
    @Input() showActions: boolean;
    @Input() showChildren: boolean;

}
