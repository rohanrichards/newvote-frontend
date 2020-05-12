import { Component, OnInit } from '@angular/core';
import { FileUploaderOptions, FileUploader, FileItem } from 'ng2-file-upload';
import { IUser } from '@app/core/models/user.model';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { UserService } from '@app/core/http/user/user.service';
import { FormGroup, FormControl } from '@angular/forms';
import { OrganizationService } from '@app/core';
import { OrganizationQuery, CommunityQuery } from '@app/core/http/organization/organization.query';
import { IssueService } from '@app/core/http/issue/issue.service';
import { IssueQuery } from '@app/core/http/issue/issue.query';

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
        displayName: new FormControl(),
    })

    organizations: any[];
    issuesObj: any;
    enablePicker = false


    constructor(
        private auth: AuthenticationQuery,
        private userService: UserService,
        private organizationService: OrganizationService,
        private organizationQuery: CommunityQuery,
        private issueService: IssueService,
        private issueQuery: IssueQuery
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
                this.createProfileForm(res)
                this.fetchOrganizations()
                this.fetchIssues()  
                this.subscribeToCommunities()
                this.subscribeToIssues()
            })
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
        this.organizationQuery.selectAll({
            filterBy: (org) =>  {
                return userCommunities.includes(org._id)
            }
        })
            .subscribe((res) => {
                if (!res.length) this.organizations = []
                this.organizations = res
            })
    }

    createProfileForm(user: IUser) {
        const profile = {
            displayName: user.displayName,
        }
    }

    onSave() {
        // const issue = cloneDeep(this.issue)
        // this.isLoading = true
        // issue.organizations = this.organization

        // this.uploader.onCompleteAll = () => {
        //     this.isLoading = false
        // }

        // this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
        //     if (status === 200 && item.isSuccess) {
        //         merge(issue, this.issueForm.value as IIssue)
        //         const res = JSON.parse(response)
        //         issue.imageUrl = res.secure_url
        //         this.resetImage = false;
        //         this.updateWithApi(issue)
        //     }
        // }

        // if (this.newImage) {
        //     this.uploader.uploadAll()
        // } else {
        //     merge(issue, this.issueForm.value as IIssue)
        //     this.updateWithApi(issue)
        // }
    }

    togglePicker() {
        this.enablePicker = !this.enablePicker
    }
}
