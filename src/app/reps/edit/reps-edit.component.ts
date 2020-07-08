import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, startWith, map } from 'rxjs/operators'
import { IRep, Rep } from '@app/core/models/rep.model'
import { Observable, forkJoin } from 'rxjs'
import { cloneDeep, merge } from 'lodash'
import { ActivatedRoute, Router } from '@angular/router'
import { MetaService } from '@app/core/meta.service'
import { Organization } from '@app/core/models/organization.model'
import { ISolution } from '@app/core/models/solution.model'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { IssueService } from '@app/core/http/issue/issue.service'
import { IProposal } from '@app/core/models/proposal.model'
import { IIssue } from '@app/core/models/issue.model'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { RepService } from '@app/core/http/rep/rep.service'
import { RepQuery } from '@app/core/http/rep/rep.query'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'
import { AdminService } from '@app/core/http/admin/admin.service'

@Component({
    selector: 'app-reps-edit',
    templateUrl: './reps-edit.component.html',
    styleUrls: ['./reps-edit.component.scss']
})
export class RepsEditComponent implements OnInit {
    isLoading: any;
    uploader: FileUploader;
    imageUrl: any;
    imageFile: any;
    newImage: boolean;
    rep: Rep;

    separatorKeysCodes: number[] = [ENTER, COMMA];
    organization: Organization;
    allSolutions: Array<ISolution> = [];
    solutions: Array<ISolution> = [];
    proposals: Array<IProposal> = [];
    allProposals: Array<IProposal> = [];
    allIssues: Array<IIssue> = [];
    issues: Array<IIssue> = []

    filteredSolutions: Observable<ISolution[]>;
    filteredIssues: Observable<IIssue[]>;
    filteredProposals: Observable<IProposal[]>;

    repForm = new FormGroup({
        displayName: new FormControl('', [Validators.required]),
        description: new FormControl(''),
        position: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        imageUrl: new FormControl('', [Validators.required]),
        proposals: new FormControl([]),
        solutions: new FormControl([]),
        issues: new FormControl([]),
        tags: new FormControl([]),
    });

    DEFAULT_IMAGE = 'assets/logo-no-text.png'

    @ViewChild('fileInput', { static: true }) fileInput: ElementRef<HTMLInputElement>;
    @ViewChild('solutionInput', { static: true }) solutionInput: ElementRef<HTMLInputElement>;
    @ViewChild('proposalInput', { static: true }) proposalInput: ElementRef<HTMLInputElement>;
    @ViewChild('issueInput', { static: true }) issueInput: ElementRef<HTMLInputElement>;
    @ViewChild('solutionAuto', { static: true }) solutionAuto: MatAutocomplete;
    @ViewChild('proposalAuto', { static: true }) proposalAuto: MatAutocomplete;
    @ViewChild('issueAuto', { static: true }) issueAuto: MatAutocomplete;
    resetImage: boolean
    MAX_LENGTH = 1000;
    currentChars: number;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private meta: MetaService,
        private solutionService: SolutionService,
        private proposalService: ProposalService,
        private issueService: IssueService,
        private proposalQuery: ProposalQuery,
        private solutionQuery: SolutionQuery,
        private issueQuery: IssueQuery,
        private auth: AuthenticationQuery,
        private stateService: StateService,
        private repService: RepService,
        private repQuery: RepQuery,
        private org: OrganizationQuery,
        private admin: AdminService
    ) { }

    ngOnInit() {
        this.isLoading = true
        // this.isLoading = true
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')

            this.fetchData()
            this.initiateFilters()
            this.repService.view({ id: ID, orgs: [] })
                .subscribe(
                    (res) => {
                        this.isLoading = false
                    },
                    (err) => err
                )

            this.subscribeToRepStore(ID)
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
    }

    subscribeToOrgStore(rep: any) {
        this.org.select()
            .subscribe((org: any) => {
                if (!org) return false
                this.organization = org
                this.updateTags(rep, org)
            })
    }

    updateForm(rep: any) {
        this.imageUrl = rep.imageUrl
        this.repForm.patchValue({
            position: rep.position,
            displayName: rep.displayName,
            description: rep.description,
            imageUrl: rep.imageUrl,
            tags: rep.tags
        })

        if (rep.description.length) {
            const div = document.createElement('div')
            div.innerHTML = rep.description
            this.currentChars = div.textContent.length
        }
    }

    updateTags(rep: any, org: any) {
        this.meta.updateTags(
            {
                title: `Edit ${rep.displayName}`,
                appBarTitle: `Edit ${org.representativeTitle}`,
            })
    }

    subscribeToRepStore(id: any) {
        this.repQuery.selectAll({
            filterBy: (rep) => rep._id === id
        })
            .subscribe((repArray: any) => {
                if (!repArray.length) return false
                const [rep, ...rest] = repArray
                this.rep = rep
                this.updateForm(rep)
                this.subscribeToOrgStore(rep)
                // Used to get entity data after rep has been loaded
                this.subscribeToStores(rep)
            })
    }

    initiateFilters() {
        this.filteredSolutions = this.repForm.get('solutions').valueChanges.pipe(
            startWith(''),
            map((solution: string) => solution ? this._filter(solution, this.allSolutions) : this.allSolutions.slice()))

        this.filteredProposals = this.repForm.get('proposals').valueChanges.pipe(
            startWith(''),
            map((proposal: string) => proposal ? this._filter(proposal, this.allProposals) : this.allProposals.slice()))

        this.filteredIssues = this.repForm.get('issues').valueChanges.pipe(
            startWith(''),
            map((issue: string) => {
                return issue ? this._filter(issue, this.allIssues) : this.allIssues.slice()
            }))
    }

    subscribeToStores(rep: any) {
        let { proposals, solutions, issues } = rep
        proposals = proposals.map((proposal: any) => {
            if (typeof proposal === 'string') {
                return proposal
            }
            return proposal._id
        })
        solutions = solutions.map((solution: any) => {
            if (typeof solution === 'string') {
                return solution
            }
            return solution._id
        })
        issues = issues.map((issue: any) => {
            if (typeof issue === 'string') {
                return issue
            }
            return issue._id
        })
        // All entities
        this.proposalQuery.proposals$
            .subscribe((res) => {
                this.allProposals = res
            })
        this.solutionQuery.solutions$
            .subscribe((res) => {
                this.allSolutions = res
            })
        this.issueQuery.issues$
            .subscribe((res) => {
                this.allIssues = res
            })

        // selectedEntities
        this.proposalQuery.selectAll({
            filterBy: (proposal: any) => proposals.includes(proposal._id)
        })
            .subscribe((res) => {
                if (!res.length) return false
                this.proposals = res
            })
        this.solutionQuery.selectAll({
            filterBy: (solution: any) => solutions.includes(solution._id)
        })
            .subscribe((res) => {
                if (!res.length) return false

                this.solutions = res
            })

        this.issueQuery.selectAll({
            filterBy: (issue: any) => issues.includes(issue._id)
        })
            .subscribe((res) => {
                if (!res.length) return false
                this.issues = res
            })
    }

    fetchData() {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        // this.isLoading = true
        // this.stateService.setLoadingState(AppState.loading)

        const getSolutions = this.solutionService.list({ params })
        const getProposals = this.proposalService.list({ params })
        const getIssues = this.issueService.list({ params })

        forkJoin({
            solutions: getSolutions,
            proposals: getProposals,
            issues: getIssues
        })
            .subscribe(
                () => {
                    this.stateService.setLoadingState(AppState.complete)
                },
                () => {
                    return this.stateService.setLoadingState(AppState.error)
                }
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

    // onResetImage() {
    //     this.newImage = false
    //     this.imageUrl = this.repForm.get('imageUrl').value
    //     this.resetImage = false;
    //     this.fileInput.nativeElement.value = null;
    // }

    setDefaultImage() {
        this.newImage = false
        this.imageUrl = this.DEFAULT_IMAGE
        this.resetImage = true
        this.fileInput.nativeElement.value = null
    }

    onSave() {
        const rep = cloneDeep(this.rep)
        merge(rep, this.repForm.value as IRep)
        // merge(rep, this.repForm.value) as IRep
        this.isLoading = true

        // this.isLoading = true
        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                rep.imageUrl = res.secure_url
                this.resetImage = false
                this.updateWithApi(rep)
            }
        }

        if (this.newImage) {
            this.uploader.uploadAll()
        } else {
            this.updateWithApi(rep)
        }
    }

    updateWithApi(newRep: any) {
        this.isLoading = true
        newRep.solutions = this.solutions
        newRep.proposals = this.proposals
        newRep.issues = this.issues
        newRep.organizations = this.organization

        if (this.resetImage) {
            newRep.imageUrl = this.imageUrl
        }

        this.repService.update({ id: newRep._id, entity: newRep })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.admin.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate([`/reps/${t._id}`])
                },
                (error) => this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            )
    }

    solutionSelected(event: any) {
        const selectedItem = event.option.value
        // have to make sure the item isn't already in the list
        if (!this.solutions.some(solution => solution._id === selectedItem._id)) {
            this.solutions.push(event.option.value)
            this.repForm.get('solutions').setValue('')
            this.solutionInput.nativeElement.value = ''
        } else {
            this.repForm.get('solutions').setValue('')
            this.solutionInput.nativeElement.value = ''
        }
    }

    solutionRemoved(solution: any) {
        const index = this.solutions.indexOf(solution)

        if (index >= 0) {
            this.solutions.splice(index, 1)
        }
    }

    issueSelected(event: any) {
        const selectedItem = event.option.value
        // have to make sure the item isn't already in the list
        if (!this.issues.some(issue => issue._id === selectedItem._id)) {
            this.issues.push(event.option.value)
            this.repForm.get('issues').setValue('')
            this.issueInput.nativeElement.value = ''
        } else {
            this.repForm.get('issues').setValue('')
            this.issueInput.nativeElement.value = ''
        }
    }

    issueRemoved(issue: any) {
        const index = this.issues.indexOf(issue)

        if (index >= 0) {
            this.issues.splice(index, 1)
        }
    }

    proposalSelected(event: any) {
        const selectedItem = event.option.value
        // have to make sure the item isn't already in the list
        if (!this.proposals.some(proposal => proposal._id === selectedItem._id)) {
            this.proposals.push(event.option.value)
            this.repForm.get('proposals').setValue('')
            this.proposalInput.nativeElement.value = ''
        } else {
            this.repForm.get('proposals').setValue('')
            this.proposalInput.nativeElement.value = ''
        }
    }

    proposalRemoved(proposal: any) {
        const index = this.proposals.indexOf(proposal)

        if (index >= 0) {
            this.proposals.splice(index, 1)
        }
    }

    tagRemoved(tag: any) {
        const tags = this.repForm.get('tags').value
        const index = tags.findIndex((item: any) => {
            return item.name === tag.name
        })

        const newTags = [...tags.slice(0, index), ...tags.slice(index+1, tags.length-1)]

        this.repForm.patchValue({ tags: newTags })
    }

    handleChange(change: any) {
        const text = change.text.trim()
        this.currentChars = text.length ? text.length : 0
    }

    private _filter(value: any, entityArray: any[]): any[] {
        const title = value.title || value.name
        const filterValue = title ? title.toLowerCase() : value.toLowerCase()

        const filterVal = entityArray.filter((item: any) => {
            const { title, name } = item
            let itemTitle

            if (title) {
                itemTitle = title.toLowerCase()
            }

            if (name) {
                itemTitle = name.toLowerCase()
            }
            return itemTitle.indexOf(filterValue) !== -1
        })
        return filterVal
    }
}
