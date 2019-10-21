import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'
import { Observable } from 'rxjs'
import { map, startWith, finalize } from 'rxjs/operators'
import { merge } from 'lodash'

import { ISolution, Solution } from '@app/core/models/solution.model'
import { IIssue, Issue } from '@app/core/models/issue.model'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { IssueService } from '@app/core/http/issue/issue.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'

import { cloneDeep } from 'lodash'

@Component({
    selector: 'app-solution',
    templateUrl: './solution-edit.component.html',
    styleUrls: ['./solution-edit.component.scss']
})
export class SolutionEditComponent implements OnInit {

    solution: ISolution;
    allIssues: Array<IIssue> = [];
    issues: Array<IIssue> = [];
    organization: Organization;
    filteredIssues: Observable<IIssue[]>;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading: boolean;
    imageUrl: any;
    imageFile: File;
    newImage = false;
    uploader: FileUploader;
    solutionForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        issues: new FormControl(''),
        imageUrl: new FormControl('', [Validators.required])
    });

    @ViewChild('issueInput', { static: true }) issueInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
    @ViewChild('fileInput', { static: true }) fileInput: ElementRef<HTMLInputElement>;
    resetImage: boolean

    constructor(
        private solutionService: SolutionService,
        private issueService: IssueService,
        private organizationService: OrganizationService,
        private route: ActivatedRoute,
        public snackBar: MatSnackBar,
        private router: Router,
        private meta: MetaService,
        private issueQuery: IssueQuery,
        private solutionQuery: SolutionQuery,
        private organizationQuery: OrganizationQuery
    ) {
        this.filteredIssues = this.solutionForm.get('issues').valueChanges.pipe(
            startWith(''),
            map((issue: string) => issue ? this._filter(issue) : this.allIssues.slice()))
    }

    ngOnInit() {
        this.isLoading = true
        this.subscribeToIssuesStore()
        this.subscribeToOrganizationStore()
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.subscribeToSolutionStore(ID)
            this.solutionService.view({ id: ID, orgs: [] })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(
                    res => res,
                    err => err
                )
        })

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

        this.issueService.list({})
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    updateForm(solution: Solution) {
        this.imageUrl = solution.imageUrl
        this.solution = solution
        for (let i = 0; i < solution.issues.length; i++) {
            const issue = solution.issues[i]
            this.issues.push(issue)
        }
        this.solutionForm.setValue({
            title: solution.title,
            description: solution.description,
            imageUrl: solution.imageUrl,
            issues: ''
        })
    }

    updateTags(solution: Solution) {
        this.meta.updateTags(
            {
                title: `Edit ${solution.title}`,
                appBarTitle: 'Edit Solution',
                description: solution.description,
                image: solution.imageUrl
            })
    }

    subscribeToSolutionStore(id: string) {
        this.solutionQuery.getSolutionWithSlug(id)
            .subscribe(
                (solution: Solution[]) => {
                    if (!solution.length) return false
                    this.solution = solution[0]
                    this.updateForm(solution[0])
                    this.updateTags(solution[0])
                }
            )
    }

    subscribeToIssuesStore() {
        this.issueQuery.selectAll()
            .subscribe(
                (issues: Issue[]) => { this.allIssues = issues },
                (err) => err
            )
    }

    subscribeToOrganizationStore() {
        this.organizationQuery.select()
            .subscribe(
                (org) => { this.organization = org },
                (err) => err
            )
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
        this.imageUrl = this.solutionForm.get('imageUrl').value
        this.resetImage = false;
        this.fileInput.nativeElement.value = null;
    }

    setDefaultImage() {
        const DEFAULT_IMAGE = 'assets/solution-default.png';
        this.newImage = false;
        this.imageUrl = DEFAULT_IMAGE;
        this.resetImage = true;
        this.fileInput.nativeElement.value = null;
    }

    onSave() {
        const solution = cloneDeep(this.solution)
        merge(solution, this.solutionForm.value) as ISolution

        this.isLoading = true
        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                solution.imageUrl = res.secure_url
                this.resetImage = false;
                this.updateWithApi(solution)
            }
        }

        if (this.newImage) {
            this.uploader.uploadAll()
        } else {
            this.updateWithApi(solution)
        }
    }

    updateWithApi(solution: any) {
        solution.organizations = this.organization
        solution.issues = this.issues

        if (this.resetImage) {
            solution.imageUrl = this.imageUrl;
        }

        this.solutionService.update({ id: solution._id, entity: solution })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate([`/solutions/${t.slug || t._id}`])
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

    issueSelected(event: any) {
        const selectedItem = event.option.value
        // have to make sure the item isn't already in the list
        if (!this.issues.some(issue => issue._id === selectedItem._id)) {
            this.issues.push(event.option.value)
            this.solutionForm.get('issues').setValue('')
            this.issueInput.nativeElement.value = ''
        } else {
            this.solutionForm.get('issues').setValue('')
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
