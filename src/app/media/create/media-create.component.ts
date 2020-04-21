import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'
import { Observable } from 'rxjs'
import { map, startWith, finalize, debounceTime } from 'rxjs/operators'

import { IMedia } from '@app/core/models/media.model'
import { IIssue } from '@app/core/models/issue.model'
import { MediaService } from '@app/core/http/media/media.service'
import { IssueService } from '@app/core/http/issue/issue.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { AdminService } from '@app/core/http/admin/admin.service'

@Component({
    selector: 'app-media',
    templateUrl: './media-create.component.html',
    styleUrls: ['./media-create.component.scss']
})
export class MediaCreateComponent implements OnInit {

    media: IMedia;
    allIssues: Array<IIssue> = [];
    issues: Array<IIssue> = [];
    organization: Organization;
    filteredIssues: Observable<IIssue[]>;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading = true;
    imageUrl: any;
    uploader: FileUploader;
    usingMetaImage = false;
    mediaForm = new FormGroup({
        url: new FormControl('', [Validators.required]),
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        issues: new FormControl(''),
        image: new FormControl('', [])
    });

    @ViewChild('issueInput', { static: true }) issueInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

    constructor(
        private mediaService: MediaService,
        private issueService: IssueService,
        private organizationService: OrganizationService,
        public snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private meta: MetaService,
        private admin: AdminService
    ) {
        this.filteredIssues = this.mediaForm.get('issues').valueChanges.pipe(
            startWith(''),
            map((issue: string) => issue ? this._filter(issue) : this.allIssues.slice()))

        this.mediaForm.get('url').valueChanges.pipe(debounceTime(500)).subscribe(url => {
            this.isLoading = true
            const uri = encodeURIComponent(url).replace(/'/g, '%27').replace(/"/g, '%22')
            this.mediaService.meta({ uri: uri }).subscribe((metadata: any) => {
                this.isLoading = false
                this.imageUrl = metadata.image
                this.usingMetaImage = true
                this.mediaForm.patchValue({
                    title: metadata.title,
                    description: metadata.description
                })

            })
        })
    }

    ngOnInit() {
        this.isLoading = true
        this.meta.updateTags(
            {
                title: 'Create Media',
                description: 'Create media entries for site content.'
            })
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            if (ID) {
                this.issueService.view({ id: ID, orgs: [] })
                    .pipe(finalize(() => { this.isLoading = false }))
                    .subscribe(issue => {
                        if (issue) {
                            this.issues.push(issue)
                        }
                    })
            } else {
                this.isLoading = false
            }
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

        this.issueService.list({})
            .subscribe(issues => { this.allIssues = issues })
    }

    onFileChange(event: any) {
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            reader.onload = (pe: ProgressEvent) => {
                this.imageUrl = (pe.target as FileReader).result
            }

            reader.readAsDataURL(file)
            this.usingMetaImage = false
        }
    }

    onSave() {
        this.isLoading = true
        this.media = this.mediaForm.value as IMedia
        this.media.issues = this.issues
        this.media.organizations = this.organization

        if (!this.usingMetaImage) {
            this.saveWithImageUpload()
        } else {
            this.media.image = this.imageUrl

            this.mediaService.create({ entity: this.media })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(t => {
                    if (t.error) {
                        this.admin.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK')
                    } else {
                        this.admin.openSnackBar('Succesfully created', 'OK')
                        this.location.back()
                    }
                })
        }
    }

    saveWithImageUpload() {
        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                this.media.image = res.secure_url

                this.mediaService.create({ entity: this.media })
                    .pipe(finalize(() => { this.isLoading = false }))
                    .subscribe(t => {
                        if (t.error) {
                            this.admin.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK')
                        } else {
                            this.admin.openSnackBar('Succesfully created', 'OK')
                            this.location.back()
                        }
                    })
            }
        }

        this.uploader.uploadAll()
    }

    issueSelected(event: any) {
        const selectedItem = event.option.value
        // have to make sure the item isn't already in the list
        if (!this.issues.some(issue => issue._id === selectedItem._id)) {
            this.issues.push(event.option.value)
            this.mediaForm.get('issues').setValue('')
            this.issueInput.nativeElement.value = ''
        } else {
            this.mediaForm.get('issues').setValue('')
            this.issueInput.nativeElement.value = ''
        }
    }

    issueRemoved(issue: any) {
        const index = this.issues.indexOf(issue)

        if (index >= 0) {
            this.issues.splice(index, 1)
        }
    }

    private _filter(value: any): IIssue[] {
        const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase()

        const filterVal = this.allIssues.filter(issue => {
            const name = issue.name.toLowerCase()
            const compare = name.indexOf(filterValue) !== -1
            return compare
        })
        return filterVal
    }

}
