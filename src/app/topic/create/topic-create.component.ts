import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'
import { finalize } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material'

import { ITopic } from '@app/core/models/topic.model'
import { Organization } from '@app/core/models/organization.model'
import { TopicService } from '@app/core/http/topic/topic.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { AdminService } from '@app/core/http/admin/admin.service'
import { cloudinaryUploader } from '@app/shared/helpers/cloudinary'

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

        this.uploader = cloudinaryUploader()
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
                                // Navigates to /topics (due to using relative routes)
                                this.router.navigate(['../'], { relativeTo: this.route })
                            }
                        },
                        err => err
                    )
            }
        }

        this.uploader.uploadAll()
    }

}
