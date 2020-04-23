import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { MatAutocomplete } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'
import { Observable, forkJoin } from 'rxjs'
import { map, startWith, finalize } from 'rxjs/operators'
import { merge, cloneDeep } from 'lodash'

import { IIssue, Issue } from '@app/core/models/issue.model'
import { ITopic, Topic } from '@app/core/models/topic.model'
import { IssueService } from '@app/core/http/issue/issue.service'
import { TopicService } from '@app/core/http/topic/topic.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { AppState } from '@app/core/models/state.model'
import { StateService } from '@app/core/http/state/state.service'
import { AdminService } from '@app/core/http/admin/admin.service'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { TopicQuery } from '@app/core/http/topic/topic.query'
import { cloudinaryUploader } from '@app/shared/helpers/cloudinary'

@Component({
    selector: 'app-issue',
    templateUrl: './issue-edit.component.html',
    styleUrls: ['./issue-edit.component.scss']
})
export class IssueEditComponent implements OnInit {

    issue: IIssue;
    organization: Organization;
    allTopics: Array<ITopic> = [];
    topics: Array<ITopic> = [];
    filteredTopics: Observable<ITopic[]>;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading: boolean;
    imageUrl: any;
    imageFile: File;
    newImage = false;
    uploader: FileUploader;
    issueForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        topics: new FormControl(''),
        imageUrl: new FormControl('', [Validators.required])
    });

    resetImage: boolean

    @ViewChild('topicInput', { static: true }) topicInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
    @ViewChild('fileInput', { static: true }) fileInput: ElementRef<HTMLInputElement>;

    constructor(
        private issueService: IssueService,
        private topicService: TopicService,
        private organizationService: OrganizationService,
        private route: ActivatedRoute,
        private router: Router,
        private meta: MetaService,
        private issueQuery: IssueQuery,
        private stateService: StateService,
        private admin: AdminService,
        private auth: AuthenticationQuery,
        private topicQuery: TopicQuery
    ) {
        this.filteredTopics = this.issueForm.get('topics').valueChanges.pipe(
            startWith(''),
            map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()))
    }

    ngOnInit() {
        this.isLoading = true
        this.route.paramMap.subscribe(params => {
            const organization = params.get('id')
            const ID = params.get('issueId')
            this.subscribeToIssueStore(ID)
            this.subscribeToTopicStore()
            this.fetchData(ID, organization)
        })

        this.uploader = cloudinaryUploader()
    }

    fetchData(issueId: string, url: string) {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }
        const getOrganization = this.organizationService.view({ id: url, params })
        const topics = this.topicService.list({ orgs: [url], params })
        const issue = this.issueService.view({ id: issueId, orgs: [url] })

        forkJoin({
            organizations: getOrganization,
            topics,
            issue
        })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    subscribeToIssueStore(id: string) {

        let issueQuery
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            issueQuery = this.issueQuery.getIssueWithTopic(id)

        } else {
            issueQuery = this.issueQuery.getIssueWithTopic(id)
        }

        issueQuery.subscribe((issue: Issue) => {
            if (!issue) return false
            this.updateForm(issue)
        })
    }

    subscribeToTopicStore() {
        this.topicQuery.selectAll({})
            .subscribe(
                (topics: Topic[]) => { this.allTopics = topics },
                (err: any) => err
            )
    }

    updateForm(issue: Issue) {
        this.imageUrl = issue.imageUrl
        this.issue = issue
        for (let i = 0; i < issue.topics.length; i++) {
            const topic = issue.topics[i]
            this.topics.push(topic)
        }
        this.issueForm.setValue({
            name: issue.name,
            description: issue.description,
            imageUrl: issue.imageUrl,
            topics: ''
        })

        this.meta.updateTags(
            {
                title: `Edit ${issue.name}`,
                appBarTitle: 'Edit Issue',
                description: issue.description
            })
    }

    onFileChange(event: any) {
        this.newImage = true
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            this.imageFile = file

            reader.onload = (pe: ProgressEvent) => {
                this.imageUrl = (pe.target as FileReader).result
            }

            reader.readAsDataURL(file)
        }
    }

    onResetImage() {
        this.newImage = false
        this.imageUrl = this.issueForm.get('imageUrl').value
        this.fileInput.nativeElement.value = null;
    }

    setDefaultImage() {
        const DEFAULT_IMAGE = 'assets/issue-default.png';
        this.newImage = false;
        this.imageUrl = DEFAULT_IMAGE;
        this.resetImage = true;
        // For chrome browsers the input needs to have value reset or same files cannot be uploaded after one another
        this.fileInput.nativeElement.value = null;
    }

    onSave() {
        const issue = cloneDeep(this.issue)
        this.isLoading = true
        issue.organizations = this.organization

        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                merge(issue, this.issueForm.value as IIssue)
                const res = JSON.parse(response)
                issue.imageUrl = res.secure_url
                this.resetImage = false;
                this.updateWithApi(issue)
            }
        }

        if (this.newImage) {
            this.uploader.uploadAll()
        } else {
            merge(issue, this.issueForm.value as IIssue)
            this.updateWithApi(issue)
        }
    }

    updateWithApi(issue: any) {
        issue.topics = this.topics

        if (this.resetImage) {
            issue.imageUrl = this.imageUrl
        }

        this.issueService.update({ id: issue._id, entity: issue })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.stateService.setLoadingState(AppState.loading)
                    this.admin.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate([`../../../issues/${t.slug || t._id}`], { relativeTo: this.route })
                },
                (error) => this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            )
    }

    topicSelected(event: any) {
        const selectedItem = event.option.value

        if (!this.topics.some(topic => topic._id === selectedItem._id)) {
            this.topics.push(event.option.value)
            this.issueForm.get('topics').setValue('')
            this.topicInput.nativeElement.value = ''
        } else {
            this.issueForm.get('topics').setValue('')
            this.topicInput.nativeElement.value = ''
        }
    }

    topicRemoved(topic: any) {
        const index = this.topics.indexOf(topic)

        if (index >= 0) {
            this.topics.splice(index, 1)
        }
    }

    private _filter(value: any): ITopic[] {
        const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase()

        const filterVal = this.allTopics.filter(topic => {
            const name = topic.name.toLowerCase()
            const compare = name.indexOf(filterValue) !== -1
            return compare
        })
        return filterVal
    }

}
