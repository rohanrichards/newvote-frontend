import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Progress } from '@app/core/models/progress.model'

@Component({
    selector: 'app-progress-form',
    templateUrl: './progress-form.component.html',
    styleUrls: ['./progress-form.component.scss']
})
export class ProgressFormComponent implements OnChanges {

    @Input() item: any = {
        name: 'Issue'
    };

    @Input() progress: Progress;
    @Output() updateProgressState = new EventEmitter();

    currentActiveState: string;
    showForm = false;
    showProgress = false;

    progressForm = new FormGroup({
        description: new FormControl('', [Validators.required])
    })

    progressStateForm = new FormGroup({
        progressState: new FormControl('', [Validators.required])
    })

    ngOnInit() {
        console.log(this.progress, 'this is progress')
        this.setCurrentActiveState(this.progress)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.progress) {
            // when component inits the radio group has no value
            // once progress object is received can then look for the active element by looking for the last active elemtn in array

            // Take the state array, and remove any entries that are false
            // once we have all the true entries, select last in array to be the active element
            // in the radio form group
            const filteredState = changes.progress.currentValue.states.slice().filter((state: any) => {
                return !!state.active
            })

            this.currentActiveState = filteredState[filteredState.length - 1].name || ''
        }
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

    getStates(object: Progress) {

        return object.states
    }

    //
    setCurrentActiveState(stateObj: any) {
        const filteredState = stateObj.states.slice().filter((state: any) => {
            return !!state.active
        })

        this.currentActiveState = filteredState[filteredState.length - 1].name || ''
    }
}
