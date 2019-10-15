import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-header',
    templateUrl: './skeleton-header.component.html',
    styleUrls: ['./skeleton-header.component.scss']
})
export class SkeletonHeaderComponent {

    @Input() noLogo: boolean;
}
