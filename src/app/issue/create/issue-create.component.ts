import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload'
import { Observable } from 'rxjs'
import { map, startWith, finalize, delay } from 'rxjs/operators'

import { IIssue } from '@app/core/models/issue.model'
import { ITopic, Topic } from '@app/core/models/topic.model'
import { IssueService } from '@app/core/http/issue/issue.service'
import { TopicService } from '@app/core/http/topic/topic.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { TopicQuery } from '@app/core/http/topic/topic.query'

@Component({
    selector: 'app-issue',
    templateUrl: './issue-create.component.html',
    styleUrls: ['./issue-create.component.scss']
})
export class IssueCreateComponent implements OnInit {

    issue: IIssue;
    allTopics: Array<ITopic> = [];
    topics: Array<ITopic> = [];
    filteredTopics: Observable<ITopic[]>;
    organization: Organization;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading: boolean;
    imageUrl: any;
    uploader: FileUploader;
    userImageUpload: boolean;
    issueForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        topics: new FormControl(''),
        imageUrl: new FormControl('', [])
    });

    suggestionTemplate: any;

    @ViewChild('topicInput', { static: true }) topicInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

    constructor(
        private suggestionService: SuggestionService,
        private issueService: IssueService,
        private topicService: TopicService,
        private organizationService: OrganizationService,
        public snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private meta: MetaService,
        private topicQuery: TopicQuery
    ) {
        this.filteredTopics = this.issueForm.get('topics').valueChanges.pipe(
            startWith(''),
            map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()))
    }

    ngOnInit() {
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

        this.subscribeToTopicStore()

        this.uploader = new FileUploader(uploaderOptions)

        this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
            // Add Cloudinary's unsigned upload preset to the upload form
            form.append('upload_preset', 'qhf7z3qa')
            // Add file to upload
            form.append('file', fileItem)

            // Use default "withCredentials" value for CORS requests
            fileItem.withCredentials = false
            return { fileItem, form }
        }

        this.topicService.list({})
            .subscribe(
                res => res,
                (err) => err
            )

        this.organizationService.get().subscribe(org => this.organization = org)

        this.meta.updateTags(
            {
                title: 'Create Issue',
                description: 'Issues can be any problem or topic in your community that you think needs to be addressed.'
            })

        this.route.paramMap
            .pipe(
                map(() => window.history.state),
                delay(0)
            )
            .subscribe((suggestion) => {
                if (suggestion._id) {
                    this.suggestionTemplate = suggestion
                    this.issueForm.patchValue({
                        name: suggestion.title,
                        description: suggestion.description
                    })
                }
            })
    }

    subscribeToTopicStore() {
        this.topicQuery.selectAll()
            .subscribe(
                (topics: Topic[]) => this.allTopics = topics
            )
    }

    onFileChange(event: any) {
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            reader.onload = (pe: ProgressEvent) => {
                this.imageUrl = (<FileReader>pe.target).result
            }

            reader.readAsDataURL(file)
            // flag - user has attempted to upload an image
            this.userImageUpload = true
        }
    }

    onSave() {
        this.isLoading = true
        this.issue = <IIssue> this.issueForm.value
        this.issue.topics = this.topics
        this.issue.organizations = this.organization

        if (this.suggestionTemplate) {
            this.issue.suggestionTemplate = this.suggestionTemplate
        }

        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        if (!this.userImageUpload) {
            // this.imageUrl = 'assets/issue-default.png';
            return this.issueService.create({ entity: this.issue })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(
                    (t) => {
                        if (this.suggestionTemplate) {
                            this.hideSuggestion()
                        }

                        this.openSnackBar('Succesfully created', 'OK')
                        this.router.navigate([`/issues/${t._id}`])
                    },
                    (err) => {
                        this.openSnackBar(`Something went wrong: ${err.status} - ${err.statusText}`, 'OK')
                    }
                )
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                this.issue.imageUrl = res.secure_url

                this.issueService.create({ entity: this.issue })
                    .pipe(finalize(() => { this.isLoading = false }))
                    .subscribe(t => {
                        if (t.error) {
                            this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK')
                        } else {
                            this.openSnackBar('Succesfully created', 'OK')
                            this.router.navigate(['/issues'], { queryParams: { forceUpdate: true } })
                        }
                    })
            }
        }

        this.uploader.uploadAll()
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        })
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

    private hideSuggestion() {
        const updatedSuggestion = {
            ...this.suggestionTemplate,
            softDeleted: true
        }

        this.suggestionService.update({ id: updatedSuggestion._id, entity: updatedSuggestion, forceUpdate: true })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (res) => res,
                (err) => err
            )
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
