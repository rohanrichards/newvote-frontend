import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material';
import { finalize, startWith, map } from 'rxjs/operators';
import { IRep, Rep } from '@app/core/models/rep.model';
import { merge, Observable, forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash'
import { ActivatedRoute, Router } from '@angular/router';
import { MetaService } from '@app/core/meta.service';
import { Organization } from '@app/core/models/organization.model';
import { ISolution } from '@app/core/models/solution.model';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { IProposal } from '@app/core/models/proposal.model';
import { IIssue } from '@app/core/models/issue.model';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { SolutionQuery } from '@app/core/http/solution/solution.query';
import { IssueQuery } from '@app/core/http/issue/issue.query';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { RepService } from '@app/core/http/rep/rep.service';
import { RepQuery } from '@app/core/http/rep/rep.query'

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
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        position: new FormControl(''),
        imageUrl: new FormControl('', [Validators.required]),
        proposals: new FormControl([]),
        solutions: new FormControl([]),
        issues: new FormControl([]),
    });

    @ViewChild('fileInput', { static: true }) fileInput: ElementRef<HTMLInputElement>;
    @ViewChild('solutionInput', { static: true }) solutionInput: ElementRef<HTMLInputElement>;
    @ViewChild('proposalInput', { static: true }) proposalInput: ElementRef<HTMLInputElement>;
    @ViewChild('issueInput', { static: true }) issueInput: ElementRef<HTMLInputElement>;
    @ViewChild('solutionAuto', { static: true }) solutionAuto: MatAutocomplete;
    @ViewChild('proposalAuto', { static: true }) proposalAuto: MatAutocomplete;
    @ViewChild('issueAuto', { static: true }) issueAuto: MatAutocomplete;
    resetImage: boolean

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
        private repQuery: RepQuery
    ) { }

    ngOnInit() {
        this.isLoading = true
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')

            // this.repService.view({ id: ID, orgs: [] })

            // this.subscribeToProposalStore(ID)
            // this.subscribeToOrganizationStore()

            // this.proposalService.view({ id: ID, orgs: [] })
            //     .pipe(finalize(() => { this.isLoading = false }))
            //     .subscribe(
            //         (res) => res,
            //         (err) => err
            //     )
        })

        this.fetchData()
        this.subscribeToStores()
        this.initiateFilters()

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

    subscribeToStores() {
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
    }

    fetchData() {
        const isModerator = this.auth.isModerator()
        const params = { showDeleted: isModerator ? true : ' ' }

        this.isLoading = true
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

    onResetImage() {
        this.newImage = false
        this.imageUrl = this.repForm.get('imageUrl').value
        this.resetImage = false;
        this.fileInput.nativeElement.value = null;
    }

    setDefaultImage() {
        const DEFAULT_IMAGE = 'assets/action-default.png';
        this.newImage = false;
        this.imageUrl = DEFAULT_IMAGE;
        this.resetImage = true;
        this.fileInput.nativeElement.value = null;
    }

    onSave() {
        const rep = cloneDeep(this.rep)
        // merge(rep, this.repForm.value)

        this.isLoading = true
        this.uploader.onCompleteAll = () => {
            this.isLoading = false
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)
                rep.imageUrl = res.secure_url
                this.resetImage = false;
                this.updateWithApi(rep)
            }
        }

        if (this.newImage) {
            this.uploader.uploadAll()
        } else {
            this.updateWithApi(rep)
        }
    }

    updateWithApi(rep: any) {
        // rep.organizations = this.organization
        // rep.solutions = this.solutions

        // if (this.resetImage) {
        //     rep.imageUrl = this.imageUrl;
        // }

        // this.proposalService.update({ id: proposal._id, entity: proposal })
        //     .pipe(finalize(() => { this.isLoading = false }))
        //     .subscribe(
        //         (t) => {
        //             this.openSnackBar('Succesfully updated', 'OK')
        //             this.router.navigate([`/proposals/${t.slug || t._id}`])
        //         },
        //         (error) => this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
        //     )
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

    private _filter(value: any, entityArray: any[]): any[] {
        const filterValue = value.title ? value.title.toLowerCase() : value.toLowerCase()

        const filterVal = entityArray.filter((item: any) => {
            const { title, name } = item
            let itemTitle;

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
