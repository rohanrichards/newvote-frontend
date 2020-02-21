import { Component, OnInit, Input } from '@angular/core'
import { Progress } from '@app/core/models/progress.model'

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {

    @Input() progressState: any;

    getStates(object: Progress) {
        if (!object) return false
        return object.states
    }
}
