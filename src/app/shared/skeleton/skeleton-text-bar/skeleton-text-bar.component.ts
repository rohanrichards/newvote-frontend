import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-text-bar',
    templateUrl: './skeleton-text-bar.component.html',
    styleUrls: ['./skeleton-text-bar.component.scss']
})
export class SkeletonTextBarComponent {

    @Input() isHeading: boolean;
    @Input() isSubtitle: boolean;
    @Input() isText: boolean;
    @Input() isMarginLess: boolean;
    @Input() width: number;

}
