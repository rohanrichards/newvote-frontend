import { Component, OnInit, Input } from '@angular/core'

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {

    @Input() steps: number;
    activeField = 2;
    fields: Array<string> = ['Proposal', 'Raised', 'Acknowledged', 'In Progress', 'Outcome']

    constructor() { }

    ngOnInit() {
    }

    getActive(index: number) {
        if (index < this.activeField) {
            return true
        }

        return false
    }

}
