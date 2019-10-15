import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-child-card',
    templateUrl: './skeleton-child-card.component.html',
    styleUrls: ['./skeleton-child-card.component.scss']
})
export class SkeletonChildCardComponent {

    @Input() showImage: boolean;
    @Input() showVote: boolean;

}
