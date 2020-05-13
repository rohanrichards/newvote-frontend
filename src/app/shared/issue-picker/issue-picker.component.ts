import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { IUser } from '@app/core/models/user.model';
import { IOrganization } from '@app/core/models/organization.model';
import { IIssue } from '@app/core/models/issue.model';
import { MatSelectionListChange } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

type Subscription = {
    isSubscribed: boolean;
    issues: string[];
}
@Component({
  selector: 'app-issue-picker',
  templateUrl: './issue-picker.component.html',
  styleUrls: ['./issue-picker.component.scss']
})
export class IssuePickerComponent implements OnInit {
    @Input() isEnabled: boolean;
    @Input() parentForm: FormGroup;
    @Input() user: IUser;
    @Input() organizations: any[] = []
    @Input() issues: any;

    selectedItem: string;

    subscriptionForm: FormGroup;

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.initForm(this.user.subscriptions)
        this.parentForm.addControl('subscriptions', this.subscriptionForm)
    }

    handleClick(item: string) {
        this.selectedItem = item !== this.selectedItem ? item : ''
        if (!this.selectedItem) return false
        // If an organizationId is selected that does not currently exist on the subscription form
        // generate scaffold object to support adding and removing issue subscriptions
        const currentForm = this.subscriptionForm.value
        if (!currentForm[this.selectedItem]) {
            this.addControl(this.selectedItem)
        }
    }

    initForm(subscriptions: any): void {
        this.subscriptionForm = this.fb.group({
        })
        if (!subscriptions) return
        Object.entries(subscriptions).forEach(([key, value]: any) => {
            if (!key) return false
            this.addControl(key, value)
        })
    }

    addControl(id: string, value?: Subscription): void {
        const group = this.createFormGroup(value)
        this.subscriptionForm.addControl(id, group)
    }

    createFormGroup(value?: Subscription): FormGroup {
        return this.fb.group({
            isSubscribed: [(value && value.isSubscribed) || false],
            issues: this.fb.array((value && value.issues) || [])
        })
    }

    handleChange(event: MatSelectionListChange): void {
        (this.subscriptionForm.get(this.selectedItem) as FormGroup).setControl('issues', this.fb.array(event.source._value || []))
    }
}
