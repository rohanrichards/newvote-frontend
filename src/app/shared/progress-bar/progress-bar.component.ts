import { Component, OnInit, Input } from '@angular/core'
import { Progress } from '@app/core/models/progress.model'

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {

    @Input() progressState: Progress;

    constructor() { }

    ngOnInit() {

    }

    getStates(object: Progress) {
        return object.states
    }
}
