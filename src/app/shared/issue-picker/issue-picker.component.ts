import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { IUser } from '@app/core/models/user.model';
import { IOrganization } from '@app/core/models/organization.model';
import { IIssue } from '@app/core/models/issue.model';
import { MatSelectionListChange } from '@angular/material';

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

    subscriptionForm = this.fb.group({
    })

    // subscription = {
    //   "kip": {
    //     issues: [],
    //     isSubscribed: true
    //   }
    // }

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.parentForm.addControl('subscriptions', this.subscriptionForm)

        this.organizations.forEach((organization) => {
            this.addControl(organization)
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

    addControl(organization: IOrganization): void {
        this.subscriptionForm.addControl(organization._id, this.createFormGroup())
    }

    createFormGroup() {
        return this.fb.group({
            isSubscribed: [false],
            issues: this.fb.array([])
        })
    }

    handleChange(event: MatSelectionListChange): void {
        (this.subscriptionForm.get(this.selectedItem) as FormGroup).setControl('issues', this.fb.array(event.source._value || []))
        
        console.log(this.subscriptionForm.value, 'this is form')
        // const id = event.option.value
        // const index = form.length ? form.findIndex((item: any) => {
        //     console.log(item)
        //     console.log(id)
        //     console.log(item)
        //     return item === id
        // }) : -1

        // console.log(event, 'this is event')
        // console.log(form, 'this is form')
        // console.log(this.subscriptionForm.value)

        // if (index !== -1) {
        //     form.removeAt(index)
        //     return
        // }

        // form.push(id)
    }
}
