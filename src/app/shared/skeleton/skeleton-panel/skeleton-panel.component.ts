import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-panel',
    templateUrl: './skeleton-panel.component.html',
    styleUrls: ['./skeleton-panel.component.scss']
})
export class SkeletonPanelComponent {

    @Input() hasChip: boolean;
    @Input() hasVote: boolean;

}
