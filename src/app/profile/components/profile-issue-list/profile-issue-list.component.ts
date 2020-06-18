import { Component, OnInit, Input } from '@angular/core'
import { IOrganization, Organization } from '@app/core/models/organization.model'
import { IUser } from '@app/core/models/user.model';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material';
import { IIssue } from '@app/core/models/issue.model';


type Subscription = {
    isSubscribed: boolean;
    issues: string[];
}

@Component({
    selector: 'app-profile-issue-list',
    templateUrl: './profile-issue-list.component.html',
    styleUrls: ['./profile-issue-list.component.scss'],
})
export class ProfileIssueListComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() avatar = 'https://via.placeholder.com/75'
    @Input() organization: Organization;
    @Input() user: IUser;
    @Input() isEnabled: boolean;
    @Input() issues: any;

    subscriptionForm: FormGroup;
    selectedItem: string;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.initForm(this.user.subscriptions)
        this.parentForm.addControl('subscriptions', this.subscriptionForm)
    }

    initForm(subscriptions: any): void {
        const organizationId = this.organization._id
        this.subscriptionForm = this.fb.group({   
        })
        if (!subscriptions) {
            this.addControl(organizationId)
            return
        }

        this.addControl(organizationId, subscriptions[organizationId])
    }

    addControl(id: string, value?: Subscription): void {
        // User does not have a subscriptions object on profile
        // create a default formgroup for current organization / issues
        if (!value) {
            const group = this.createFormGroup()
            this.subscriptionForm.addControl(id, group)
            return
        }
        const group = this.createFormGroup(value)
        this.subscriptionForm.addControl(id, group)
    }

    // createDefaultFormGroup(issues: IIssue[]) {
    //     return this.fb.group({
    //         issues: this.fb.array((.issues) || []),
    //     })
    // }

    createFormGroup(value?: Subscription): FormGroup {
        return this.fb.group({
            issues: this.fb.array((value && value.issues) || []),
        })
    }

    get issueArray() {
        return this.subscriptionForm.get(`${this.organization._id}.issues`) as FormArray;
    }

    handleChange(event: MatSelectionListChange): void {
        (this.subscriptionForm.get(this.selectedItem) as FormGroup).setControl('issues', this.fb.array(event.source._value || []))
    }

    handleClick(issue: any) {
        const issueIndex = this.issueArray.value.indexOf(issue._id)
        if (issueIndex >= 0) {
            this.issueArray.removeAt(issueIndex)
        } else {
            this.issueArray.push(new FormControl(issue._id))            
        }
    }

}
