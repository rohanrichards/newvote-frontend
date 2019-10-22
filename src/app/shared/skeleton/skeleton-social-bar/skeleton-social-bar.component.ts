import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-social-bar',
    templateUrl: './skeleton-social-bar.component.html',
    styleUrls: ['./skeleton-social-bar.component.scss']
})
export class SkeletonSocialBarComponent {

    @Input() buttons = 6;

    createButtonRange() {
        const items: number[] = []
        for (let i = 1; i <= this.buttons; i++) {
            items.push(i)
        }

        return items

    }
}
