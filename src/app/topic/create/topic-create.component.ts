import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'
import { finalize } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material/snack-bar';

import { ITopic } from '@app/core/models/topic.model'
import { Organization } from '@app/core/models/organization.model'
import { TopicService } from '@app/core/http/topic/topic.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { AdminService } from '@app/core/http/admin/admin.service'

@Component({
    selector: 'app-topic',
    templateUrl: './topic-create.component.html',
    styleUrls: ['./topic-create.component.scss']
})
export class TopicCreateComponent implements OnInit {

    topic: ITopic;
    organization: Organization;
    isLoading: boolean;
    imageUrl: any;
    uploader: FileUploader;
    topicForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        imageUrl: new FormControl('', [Validators.required])
    });

    userImageUpload: boolean

    constructor(
        private topicService: TopicService,
        private organizationService: OrganizationService,
        public snackBar: MatSnackBar,
        private router: Router,
        private meta: MetaService,
        private route: ActivatedRoute,
        private admin: AdminService
    ) { }

    ngOnInit() {
        this.meta.updateTags(
            {
                title: 'Create Topic',
                description: 'Creating a new topic for the NewVote platform.'
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

        this.organizationService.get().subscribe(org => { this.organization = org })
    }

    onFileChange(event: any) {
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            reader.onload = (pe: ProgressEvent) => {
                this.imageUrl = (pe.target as FileReader).result
            }

            reader.readAsDataURL(file)
            this.userImageUpload = true
        }
    }

    setDefaultImage() {
        this.userImageUpload = false
        this.imageUrl = false
        this.topicForm.patchValue({ imageUrl: '' })
    }

    onSave() {
        this.isLoading = true
        this.topic = this.topicForm.value as ITopic
        this.topic.organizations = this.organization

        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                this.topic.imageUrl = res.secure_url

                this.topicService.create({ entity: this.topic })
                    .pipe(finalize(() => { this.isLoading = false }))
                    .subscribe(
                        t => {
                            if (t.error) {
                                this.admin.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK')
                            } else {
                                this.admin.openSnackBar('Succesfully created', 'OK')
                                this.router.navigate(['/topics'], { queryParams: { forceUpdate: true } })
                            }
                        },
                        err => err
                    )
            }
        }

        this.uploader.uploadAll()
    }

}
