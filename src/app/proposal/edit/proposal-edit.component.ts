import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload'
import { Observable } from 'rxjs'
import { map, startWith, finalize, take } from 'rxjs/operators'
import { merge, assign, cloneDeep } from 'lodash'

import { IProposal, Proposal } from '@app/core/models/proposal.model'
import { ISolution, Solution } from '@app/core/models/solution.model'
import { ProposalService } from '@app/core/http/proposal/proposal.service'
import { SolutionService } from '@app/core/http/solution/solution.service'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { ProposalQuery } from '@app/core/http/proposal/proposal.query'
import { IssueQuery } from '@app/core/http/issue/issue.query'
import { SolutionQuery } from '@app/core/http/solution/solution.query'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'

@Component({
    selector: 'app-proposal',
    templateUrl: './proposal-edit.component.html',
    styleUrls: ['./proposal-edit.component.scss']
})
export class ProposalEditComponent implements OnInit {

    proposal: IProposal;
    allSolutions: Array<ISolution> = [];
    solutions: Array<ISolution> = [];
    organization: Organization;
    filteredSolutions: Observable<ISolution[]>;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    isLoading: boolean;
    imageUrl: any;
    imageFile: File;
    newImage = false;
    uploader: FileUploader;
    proposalForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        solutions: new FormControl(''),
        imageUrl: new FormControl('', [Validators.required])
    });

    @ViewChild('solutionInput', { static: true }) solutionInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

    constructor(
        private proposalService: ProposalService,
        private solutionService: SolutionService,
        private organizationService: OrganizationService,
        private route: ActivatedRoute,
        public snackBar: MatSnackBar,
        private router: Router,
        private meta: MetaService,
        private proposalQuery: ProposalQuery,
        private issueQuery: IssueQuery,
        private solutionQuery: SolutionQuery,
        private organizationQuery: OrganizationQuery
    ) {
        this.filteredSolutions = this.proposalForm.get('solutions').valueChanges.pipe(
            startWith(''),
            map((solution: string) => solution ? this._filter(solution) : this.allSolutions.slice()))
    }

    ngOnInit() {
        this.isLoading = true
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.subscribeToProposalStore(ID)
            this.subscribeToOrganizationStore()

            this.proposalService.view({ id: ID, orgs: [] })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(
                    (res) => res,
                    (err) => err
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

        this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
            // Add Cloudinary's unsigned upload preset to the upload form
            form.append('upload_preset', 'qhf7z3qa')
            // Add file to upload
            form.append('file', fileItem)

            // Use default "withCredentials" value for CORS requests
            fileItem.withCredentials = false
            return { fileItem, form }
        }

        this.solutionService.list({})
            .subscribe(
                (res) => res,
                (err) => err
            )

    }

    updateForm(proposal: Proposal) {
        this.imageUrl = proposal.imageUrl
        this.proposalForm.setValue({
            title: proposal.title,
            description: proposal.description,
            imageUrl: proposal.imageUrl,
            solutions: ''
        })
    }

    updateTags(proposal: Proposal) {
        this.meta.updateTags(
            {
                title: `Edit ${proposal.title}`,
                appBarTitle: 'Edit Action',
                description: `${proposal.description}`
            })
    }

    subscribeToProposalStore(id: string) {
        this.proposalQuery.selectEntity(id)
            .subscribe((proposal: Proposal) => {
                if (!proposal) return false
                this.proposal = proposal
                this.updateForm(proposal)
                this.updateTags(proposal)
                this.subscribeToSolutionStore(proposal)
            })
    }

    subscribeToSolutionStore(proposal: any) {
        const { solutions } = proposal
        const solutionsArray = solutions.map((solution: any) => {
            if (typeof solution === 'string') {
                return solution
            }
            return solution._id
        })

        this.solutionQuery.selectAll()
            .subscribe((solutions: Solution[]) => {
                this.allSolutions = solutions
            })

        this.solutionQuery.selectMany(solutionsArray)
            .subscribe((solutions: Solution[]) => {
                this.solutions = solutions
            })
    }

    subscribeToOrganizationStore() {
        this.organizationQuery.select()
            .subscribe((organization: Organization) => {
                this.organization = organization
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
        this.imageUrl = this.proposalForm.get('imageUrl').value
    }

    onSave() {
        const proposal = cloneDeep(this.proposal)
        merge(proposal, <IProposal> this.proposalForm.value)

        this.isLoading = true
        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                proposal.imageUrl = res.secure_url
                this.updateWithApi(proposal)
            }
        }

        if (this.newImage) {
            this.uploader.uploadAll()
        } else {
            this.updateWithApi(proposal)
        }
    }

    updateWithApi(proposal: any) {
        proposal.organizations = this.organization
        proposal.solutions = this.solutions

        this.proposalService.update({ id: proposal._id, entity: proposal })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate([`/proposals/${t._id}`])
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

    solutionSelected(event: any) {
        const selectedItem = event.option.value
        // have to make sure the item isn't already in the list
        if (!this.solutions.some(solution => solution._id === selectedItem._id)) {
            this.solutions.push(event.option.value)
            this.proposalForm.get('solutions').setValue('')
            this.solutionInput.nativeElement.value = ''
        } else {
            this.proposalForm.get('solutions').setValue('')
            this.solutionInput.nativeElement.value = ''
        }
    }

    solutionRemoved(solution: any) {
        const index = this.solutions.indexOf(solution)

        if (index >= 0) {
            this.solutions.splice(index, 1)
        }
    }

    add(event: any) {
    }

    private _filter(value: any): ISolution[] {
        const filterValue = value.title ? value.title.toLowerCase() : value.toLowerCase()

        const filterVal = this.allSolutions.filter(solution => {
            const name = solution.title.toLowerCase()
            const compare = name.indexOf(filterValue) !== -1
            return compare
        })
        return filterVal
    }

}
