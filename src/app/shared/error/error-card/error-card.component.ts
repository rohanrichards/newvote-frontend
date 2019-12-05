import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-error-card',
    templateUrl: './error-card.component.html',
    styleUrls: ['./error-card.component.scss']
})
export class ErrorCardComponent {

    modelLinks = {
        Action: '/proposals',
        Solution: '/solutions',
        Issue: '/issues'
    }

    @Input() model: string;

}
