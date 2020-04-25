import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core'
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms'
import { Progress } from '@app/core/models/progress.model'
import { NotificationService } from '@app/core/http/notifications/notification.service';
import { Notification } from '@app/core/models/notification.model';

@Component({
    selector: 'app-progress-form',
    templateUrl: './progress-form.component.html',
    styleUrls: ['./progress-form.component.scss']
})
export class ProgressFormComponent implements OnChanges {

    constructor(private notificationService: NotificationService) {}

    @Input() item: any = {
        name: 'Issue'
    };

    @Input() progress: Progress;
    @Input() notification: Notification;
    @Output() updateProgressState = new EventEmitter();
    @Output() updateNotifications = new EventEmitter();
    @Output() submitNotificationUpdate = new EventEmitter();
    @Output() removeNotificationIfEditing = new EventEmitter();

    currentActiveState: string;
    showForm = false;
    showProgress = false;
    showFeed = false
    editNotification = false
    description = ''

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

        // as long as issues view has a notification object, progress form
        // will display an extra textarea component - need to remove it
        // to hide the component
        if (this.notification !== null) {
            this.removeNotificationIfEditing.emit()
        }

        this.showProgress = !this.showProgress
    }

    toggleNotificationForm() {
        if (this.showProgress) {
            this.showProgress = false
        }

        if (this.notification !== null) {
            this.removeNotificationIfEditing.emit()
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

    // For Radio Group
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

    submitNotification() {
        this.updateNotifications.emit(this.description)
    }

    handleEditedNotification() {
        this.submitNotificationUpdate.emit(this.notification)
    }

    checkState(state: any) {
        if (state.name === this.currentActiveState) {
            return true
        }

        return false
    }
}
