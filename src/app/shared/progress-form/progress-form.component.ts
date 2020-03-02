import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core'
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms'
import { Progress } from '@app/core/models/progress.model'

@Component({
    selector: 'app-progress-form',
    templateUrl: './progress-form.component.html',
    styleUrls: ['./progress-form.component.scss']
})
export class ProgressFormComponent implements OnChanges {

    constructor(private fb: FormBuilder) {}

    @Input() item: any = {
        name: 'Issue'
    };

    @Input() progress: Progress;
    @Output() updateProgressState = new EventEmitter();

    currentActiveState: string;
    showForm = false;
    showProgress = false;
    showFeed = false

    ngOnInit() {
        this.setCurrentActiveState(this.progress)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.progress) {
            // when component inits the radio group has no value
            // once progress object is received can then look for the active element by looking for the last active elemtn in array

            // Take the state array, and remove any entries that are false
            // once we have all the true entries, select last in array to be the active element
            // in the radio form group
            const { progress: { currentValue: progressObj } } = changes
            this.setCurrentActiveState(progressObj)
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

    handleProgressState(value: any) {
        this.updateProgressState.emit(value)
    }

    getStates(object: Progress) {
        if (!object) return false
        return object.states
    }

    setCurrentActiveState(stateObj: any) {
        const filteredState = stateObj.states.slice().filter((state: any) => {
            return state.active
        })

        if (!filteredState.length) {
            this.currentActiveState = ''
            return false
        }

        this.currentActiveState = filteredState[filteredState.length - 1].name || ''
    }

    checkState(state: any) {
        if (state.name === this.currentActiveState) {
            return true
        }

        return false
    }
}
