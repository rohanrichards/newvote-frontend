import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { IUser } from '@app/core/models/user.model';
import { IOrganization } from '@app/core/models/organization.model';
import { IIssue } from '@app/core/models/issue.model';
import { MatSelectionListChange } from '@angular/material';

type Subscription = {
    isSubscribed: boolean;
    issues: string[];
}
@Component({
  selector: 'app-issue-picker',
  templateUrl: './issue-picker.component.html',
  styleUrls: ['./issue-picker.component.scss']
})
export class IssuePickerComponent implements OnInit, OnChanges {
    @Input() isEnabled: boolean;
    @Input() parentForm: FormGroup;
    @Input() user: IUser;
    @Input() organizations: any[]
    @Input() issues: any;

    selectedItem: string;

    subscriptionForm: FormGroup;

    // subscription = {
    //   "kip": {
    //     issues: [],
    //     isSubscribed: true
    //   }
    // }

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.initForm(this.user.subscriptions)
        this.parentForm.addControl('subscriptions', this.subscriptionForm)

        this.organizations.forEach((organization) => {
            this.addControl(organization._id)
        })
    }

    ngOnChanges(changes: SimpleChanges) {

        //   changes.organizations.map((item: any) => {
        //     if (this.issueForm.get('item.url')) {

        //     }
        //   })
    }

    handleClick(item: string) {
        this.selectedItem = item !== this.selectedItem ? item : ''
    }

    initForm(subscriptions: any): void {
        Object.entries(subscriptions).forEach(([key, value]: any) => {
            if (!key) return false
            this.addControl(key, value)
        })
    }

    addControl(id: string, value?: Subscription): void {
        this.subscriptionForm.addControl(id, this.createFormGroup(value))
    }

    createFormGroup(value?: Subscription): FormGroup {
        return this.fb.group({
            isSubscribed: [value.isSubscribed || false],
            issues: this.fb.array(value.issues || [])
        })
    }

    handleChange(event: MatSelectionListChange): void {
        (this.subscriptionForm.get(this.selectedItem) as FormGroup).setControl('issues', this.fb.array(event.source._value || []))
    }
}
