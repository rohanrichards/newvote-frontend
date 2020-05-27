import { Component, OnInit } from '@angular/core';
import { FileUploaderOptions, FileUploader, FileItem } from 'ng2-file-upload';
import { IUser, IProfile } from '@app/core/models/user.model';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { UserService } from '@app/core/http/user/user.service';
import { FormGroup, FormControl } from '@angular/forms';
import { OrganizationService } from '@app/core';
import { OrganizationQuery, CommunityQuery } from '@app/core/http/organization/organization.query';
import { IssueService } from '@app/core/http/issue/issue.service';
import { IssueQuery } from '@app/core/http/issue/issue.query';
import { cloneDeep } from 'lodash'
import { finalize, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminService } from '@app/core/http/admin/admin.service';
import { PushService } from '@app/core/http/push/push.service';
import { SwPush } from '@angular/service-worker';
import { environment } from '@env/environment';
@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {

    isLoading = false
    uploader: FileUploader;

    userData: IUser
    profileForm: FormGroup = new FormGroup({
        displayName: new FormControl(''),
    })

    organizations: any[];
    issuesObj: any;
    enablePicker = false

    isEnabled = this.swPush.isEnabled;
    isGranted = Notification.permission === 'granted';
    subscriptionsActive = 'DEFAULT'

    disableNotificationSlideToggle = false;

    constructor(
        private admin: AdminService,
        private router: Router,
        private auth: AuthenticationQuery,
        private userService: UserService,
        private organizationService: OrganizationService,
        private communityQuery: CommunityQuery,
        private issueService: IssueService,
        private issueQuery: IssueQuery,
        private pushService: PushService,
        private swPush: SwPush
    ) {

        // set up the file uploader
        const uploaderOptions: FileUploaderOptions = {
            url: 'https://api.cloudinary.com/v1_1/newvote/upload',
            // Upload files automatically upon addition to upload queue
            autoUpload: false,
            // Use xhrTransport in favor of iframeTransport
            isHTML5: true,
            // Calculate progress independently for each uploaded file
            removeAfterUpload: true,
            // XHR request headers
            headers: [
                {
                    name: 'X-Requested-With',
                    value: 'XMLHttpRequest'
                }
            ]
        }

        this.uploader = new FileUploader(uploaderOptions)

        this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
            if (this.uploader.queue.length > 1) {
                this.uploader.removeFromQueue(this.uploader.queue[0])
            }
        }

        this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
            // Add Cloudinary's unsigned upload preset to the upload form
            form.append('upload_preset', 'qhf7z3qa')
            // Add file to upload
            form.append('file', fileItem)

            // Use default "withCredentials" value for CORS requests
            fileItem.withCredentials = false
            return { fileItem, form }
        }
    }

    ngOnInit() {
        this.auth.select()
            .subscribe((res) => {
                if (!res) return false
                this.userData = res
                this.subscriptionsActive = res.subscriptionsActive
                this.profileForm.get('displayName').patchValue(res.displayName || '')
                this.createProfileForm(res)
                this.fetchOrganizations()
                this.fetchIssues()
                this.subscribeToCommunities()
                this.subscribeToIssues()
            })

        this.swPush.subscription.subscribe(
            res => {
                // can't access Notification object on the template, so if notifications are 'denied' disable the slide toggle
                this.disableNotificationSlideToggle = Notification.permission === 'denied'
                this.isGranted = Notification.permission === 'granted'
            },
            err => err,
        )
    }

    fetchIssues() {
        const isModerator = this.auth.isModerator()
        const orgs = this.auth.getValue().organizations

        this.issueService.list({
            orgs,
            params: {
                showDeleted: isModerator ? 'true' : '',
                showPrivate: isModerator ? 'true' : ''
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    fetchOrganizations() {
        const isAdmin = this.auth.isAdmin()
        const orgs = this.auth.getValue().organizations
        this.organizationService.list({
            orgs,
            params: {
                showDeleted: isAdmin ? 'true' : '',
                showPrivate: isAdmin ? 'true' : ''
            }
        })
            .subscribe(
                (res) => res,
                (err) => err
            )

    }

    subscribeToIssues() {
        const userCommunities = this.auth.getValue().organizations
        this.issueQuery.getIssuesByOrganizations(userCommunities)
            .subscribe((res: any) => {
                if (!res) return false
                this.issuesObj = res
            })
    }

    subscribeToCommunities() {
        const userCommunities = this.auth.getValue().organizations
        this.communityQuery.selectMany(userCommunities)
            .subscribe((res) => {
                if (!res.length) return false
                this.organizations = res
            })
    }

    createProfileForm(user: IUser) {
        const profile = {
            displayName: user.displayName,
        }
    }

    onSave() {
        const user = cloneDeep(this.profileForm.value) as IProfile
        const { _id: id } = this.auth.getValue()
        this.userService.update({ id, entity: user })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.admin.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate(['/'])
                },
                (error) => this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            )
    }

    handleSubscriptionToggle(event: any) {
        const user = cloneDeep(this.auth.getValue())

        user.subscriptionsActive = event.checked ? 'ACCEPTED' : 'DENIED';

        // toggles the userSubscription property on the user object
        this.userService.patchUserSubscription({ id: this.auth.getValue()._id, entity: user })
            .subscribe(
                (res) => {
                    const { subscriptionsActive } = res
                    if (subscriptionsActive === 'DENIED') {
                        return this.admin.openSnackBar('Successfully unsubscribed from noitifications', 'OK');
                    }
                    // TODO - need to differentiate between when to subscribe to Notifications again, and when not to
                    this.swPush.subscription
                        .pipe(
                            take(1)
                        )
                        .subscribe(
                            (sub) => {
                                if (!sub) {
                                    return this.pushService.subscribeToNotifications(user._id)
                                }

                                return this.admin.openSnackBar('Subscribed to notifications successfully', 'OK');
                            },
                            err => err
                        )
                },
                (err) => err
            )
    }

}
