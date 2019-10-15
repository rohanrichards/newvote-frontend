import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common'
import { finalize, take } from 'rxjs/operators'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload'
import { MatSnackBar } from '@angular/material'
import { merge, cloneDeep } from 'lodash'

import { ITopic, Topic } from '@app/core/models/topic.model'
import { TopicService } from '@app/core/http/topic/topic.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { TopicQuery } from '@app/core/http/topic/topic.query'

@Component({
    selector: 'app-topic',
    templateUrl: './topic-edit.component.html',
    styleUrls: ['./topic-edit.component.scss']
})
export class TopicEditComponent implements OnInit {

    topic: Topic;
    organization: Organization;
    isLoading: boolean;
    imageUrl: any;
    imageFile: File;
    newImage = false;
    uploader: FileUploader;
    topicForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        imageUrl: new FormControl('', [Validators.required])
    });

    constructor(
        private topicService: TopicService,
        private organizationService: OrganizationService,
        private route: ActivatedRoute,
        public snackBar: MatSnackBar,
        private router: Router,
        private location: Location,
        private meta: MetaService,
        private topicQuery: TopicQuery
    ) { }

    ngOnInit() {
        this.isLoading = true
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.subscribeToTopicStore(ID)
            this.topicService.view({ id: ID, orgs: [] })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(
                    (res) => res,
                    (err) => err
                )
        })

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

        this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
            // Add Cloudinary's unsigned upload preset to the upload form
            form.append('upload_preset', 'qhf7z3qa')
            // Add file to upload
            form.append('file', fileItem)

            // Use default "withCredentials" value for CORS requests
            fileItem.withCredentials = false
            return { fileItem, form }
        }

        this.organizationService.get().subscribe(org => this.organization = org)
    }

    subscribeToTopicStore(id: string) {
        this.topicQuery.selectEntity(id)
            .subscribe((topic: Topic) => {
                if (!topic) return false
                this.updateForm(topic)
            })
    }

    updateForm(topic: Topic) {
        this.topicForm.patchValue(topic)
        this.imageUrl = topic.imageUrl
        this.topic = topic
        this.meta.updateTags(
            {
                title: `Edit ${this.topic.name}`,
                appBarTitle: 'Edit Topic',
                description: 'List all proposals.'
            })
    }

    onFileChange(event: any) {
        this.newImage = true
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            this.imageFile = file

            reader.onload = (pe: ProgressEvent) => {
                this.imageUrl = (<FileReader>pe.target).result
            }

            reader.readAsDataURL(file)
        }
    }

    onResetImage() {
        this.newImage = false
        this.imageUrl = this.topicForm.get('imageUrl').value
    }

    onSave() {
        const topic = cloneDeep(this.topic)
        this.isLoading = true
        topic.organizations = this.organization

        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                merge(topic, <ITopic> this.topicForm.value)
                const res = JSON.parse(response)
                topic.imageUrl = res.secure_url
                this.updateWithApi(topic)
            }
        }

        if (this.newImage) {
            this.uploader.uploadAll()
        } else {
            merge(topic, <ITopic> this.topicForm.value)
            this.updateWithApi(topic)
        }
    }

    updateWithApi(topic: any) {
        this.topicService.update({ id: topic._id, entity: topic })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.openSnackBar('Succesfully updated', 'OK')
                    // this.router.navigate(['/issues']);
                    this.location.back()
                },
                (error) => this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')

            )
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        })
    }

}
