import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload'
import { Observable } from 'rxjs'
import { map, startWith, finalize } from 'rxjs/operators'

import { ISolution } from '@app/core/models/solution.model'
import { IIssue } from '@app/core/models/issue.model'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { IssueService } from '@app/core/http/issue/issue.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'

@Component({
    selector: 'app-solution',
    templateUrl: './solution-create.component.html',
    styleUrls: ['./solution-create.component.scss']
})
export class SolutionCreateComponent implements OnInit {

    solution: ISolution;
    allIssues: Array<IIssue> = [];
    issues: Array<IIssue> = [];
    organization: Organization;
    filteredIssues: Observable<IIssue[]>;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading = true;
    imageUrl: any;
    uploader: FileUploader;
    userImageUpload: boolean;
    solutionForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        issues: new FormControl(''),
        imageUrl: new FormControl('', [])
    });

    @ViewChild('issueInput', { static: true }) issueInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
    suggestionTemplate: any;

    constructor(
        private suggestionService: SuggestionService,
        private solutionService: SolutionService,
        private issueService: IssueService,
        private organizationService: OrganizationService,
        public snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private router: Router,
        private meta: MetaService
    ) {
        this.filteredIssues = this.solutionForm.get('issues').valueChanges.pipe(
            startWith(''),
            map((issue: string) => issue ? this._filter(issue) : this.allIssues.slice()))
    }

    ngOnInit() {
        this.isLoading = true
        this.meta.updateTags(
            {
                title: 'Create Solution',
                description: 'Solutions are the decisions that you think your community should make.'
            })
        this.route.paramMap
            .pipe(
                map((data) => {
                    return {
                        params: { _id: data.get('id') },
                        state: window.history.state
                    }
                })
            )
            .subscribe(routeData => {
                const { params, state: suggestion } = routeData
                if (suggestion._id) {
                    this.suggestionTemplate = suggestion
                    this.populateIssue(suggestion.parent)
                    return this.solutionForm.patchValue(suggestion)
                }

                if (params._id) {
                    this.populateIssue(params._id)
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

        this.organizationService.get().subscribe(org => { this.organization = org })

    }

    populateIssue(ID: string) {
        this.issueService.view({ id: ID, orgs: [] })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                issue => {
                    if (issue) {
                        this.issues.push(issue)
                    }
                },
                (err) => err
            )
    }

    onFileChange(event: any) {
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            reader.onload = (pe: ProgressEvent) => {
                this.imageUrl = (pe.target as FileReader).result
            }

            reader.readAsDataURL(file)

            // flag - user has attempted to upload an image
            this.userImageUpload = true
        }
    }

    onSave() {
        this.isLoading = true
        this.solution = this.solutionForm.value as ISolution
        this.solution.issues = this.issues
        this.solution.organizations = this.organization

        if (this.suggestionTemplate) {
            this.solution.suggestionTemplate = this.suggestionTemplate
        }

        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        if (!this.userImageUpload) {
            // this.imageUrl = 'assets/solution-default.png';
            return this.solutionService.create({ entity: this.solution })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(
                    (t) => {

                        if (this.suggestionTemplate) {
                            this.hideSuggestion()
                        }

                        this.openSnackBar('Succesfully created', 'OK')
                        this.router.navigate([`/solutions/${t.slug || t._id}`])
                    },
                    (error) => this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                )
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                this.solution.imageUrl = res.secure_url

                this.solutionService.create({ entity: this.solution })
                    .pipe(finalize(() => { this.isLoading = false }))
                    .subscribe(
                        t => {
                            this.openSnackBar('Succesfully created', 'OK')
                            this.router.navigate([`/solutions/${t.slug || t._id}`])
                        },
                        (err) => this.openSnackBar(`Something went wrong: ${err.status} - ${err.statusText}`, 'OK')
                    )
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
