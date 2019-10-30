import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'

@Component({
    selector: 'app-progress-form',
    templateUrl: './progress-form.component.html',
    styleUrls: ['./progress-form.component.scss']
})
export class ProgressFormComponent implements OnInit {

    @Input() item: any = {
        name: 'Issue'
    };

    @Output() updateProgressState = new EventEmitter();

    progressStates: Array<string> = ['Raised', 'In Progress', 'Outcome']
    showForm = false;
    showProgress = false;

    progressForm = new FormGroup({
        description: new FormControl('', [Validators.required])
    })

    progressStateForm = new FormGroup({
        progressState: new FormControl('', [Validators.required])
    })

    constructor() { }

    ngOnInit() {
    }

    toggleProgressForm() {
        if (this.showForm) {
            this.showForm = false
        }

        this.showProgress = !this.showProgress
    }

    toggleUpdateForm() {
        if (this.showProgress) {
            this.showProgress = false
        }

        this.showForm = !this.showForm
    }

    handleProgressState(value: string) {
        this.updateProgressState.emit(value)
    }
}
