import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { Observable, forkJoin } from 'rxjs';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { AdminService } from '@app/core/http/admin/admin.service';
import { Solution } from '@app/core/models/solution.model';
import { Issue } from '@app/core/models/issue.model';
import { Suggestion } from '@app/core/models/suggestion.model';
import { MatDialogRef, MatDialog, MatAutocomplete } from '@angular/material';
import { RepModalComponent } from '@app/shared/rep-modal/rep-modal.component';
import { Rep } from '@app/core/models/rep.model';
import { RepService } from '@app/core/http/rep/rep.service';
import { RepQuery } from '@app/core/http/rep/rep.query';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { MetaService } from '@app/core/meta.service';
import { OrganizationService } from '@app/core';
import { OrganizationQuery } from '@app/core/http/organization/organization.query';
import { Organization } from '@app/core/models/organization.model';
import { FormControl } from '@angular/forms';
import { startWith, map, filter } from 'rxjs/operators';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-reps-list',
    templateUrl: './reps-list.component.html',
    styleUrls: ['./reps-list.component.scss']
})

export class RepsListComponent implements OnInit {
    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

    isLoading: boolean;
    loadingState: any;
    proposals$: Observable<Proposal[]>;
    handleImageUrl = optimizeImage;
    proposals: Proposal[] = [];
    solutions: Solution[] = [];
    issues: Issue[] = [];
    suggestions: Suggestion[] = [];
    organization: Organization;

    tagCtrl = new FormControl('')
    allTags: any[] = []
    allReps: any[] = []
    tags: string[] = []
    filteredTags: Observable<any[]>;
    filteredReps: Observable<any[]>;
    selectedTags: Array<any> = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];

    headerTitle = 'Browse Community Reps';
    headerText = 'Reps are assigned to Issues, Solutions and Actions and can be a point of contact.';

    constructor(
        public dialog: MatDialog,
        private repsService: RepService,
        private repQuery: RepQuery,
        private proposalQuery: ProposalQuery,
        private proposalService: ProposalService,
        private solutionService: SolutionService,
        private issueService: IssueService,
        public auth: AuthenticationQuery,
        public admin: AdminService,
        private meta: MetaService,
        private organizationQuery: OrganizationQuery,
        private organizationService: OrganizationService,
        private stateService: StateService,
        private route: ActivatedRoute
    ) {
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
            startWith(''),
            map((tagName: string) => {
                return tagName ? this._filter(tagName) : this.allTags.slice()
            })
        )
    }

    ngOnInit() {
        this.route.params.subscribe(
            (res: any) => {
                const { id } = res
                if (!id) return false
                this.fetchData(id)
            }
        )

        this.subscribeToOrgStore()
        this.subscribeToRepStore()

        // this.subscribeToProposalStore()
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.stateService.setLoadingState(AppState.loading)
    }

    updateTags(organization: Organization) {
        this.meta.updateTags(
            {
                title: `All ${organization.representativeTitle}`,
                appBarTitle: `All ${organization.representativeTitle}`,
                description: `View all of ${organization.name} community on the NewVote platform.`
            })
    }

    subscribeToOrgStore() {
        this.organizationQuery.select()
            .subscribe((org: any) => {
                if (!org) return false
                this.organization = org
                this.allTags = org.representativeTags.map((tagObj: any) => {
                    return tagObj.name
                })
                this.updateTags(org)
            })
    }

    // Called in services so not to throw errors not finding reps
    subscribeToRepStore() {
        this.repQuery.populateReps()
            .subscribe(
                (reps: any[]) => {
                    if (!reps.length) return false
                    this.allReps = reps
                    this.stateService.setLoadingState(AppState.complete)
                    // this.reps = reps
                },
                (err) => err
            )
    }

    fetchData(url: string) {
        const isModerator = this.auth.isModerator()
        const params = { softDeleted: isModerator ? true : '' }

        const getOrganization = this.organizationService.view({ id: url, params })
        const getSolutions = this.solutionService.list({ orgs: [url], params })
        const getProposals = this.proposalService.list({ orgs: [url], params })
        const getIssues = this.issueService.list({ orgs: [url], params })
        const getReps = this.repsService.list({ orgs: [url] })

        forkJoin({
            organization: getOrganization,
            issues: getIssues,
            solutions: getSolutions,
            proposals: getProposals,
            reps: getReps
        })
            .subscribe(
                (res) => res,
                (err) => err
            )
        this.proposalService.list({ orgs: [url], params })    

    }

    openDialog(): void {
        const dialogRef = this.dialog.open(RepModalComponent, {
            width: '500px',
            height: '60vh',
            data: { repEmail: '', newReps: [], currentReps: this.allReps, removeReps: [], representativeTags: this.organization.representativeTags, tagsUpdated: false }
        })

        dialogRef.afterClosed().subscribe(result => {
            if (!result) return false
            const { newReps, removeReps, currentReps, representativeTags, tagsUpdated } = result
            if (removeReps.length) {
                this.deleteReps(removeReps)
            }
            if (newReps.length) {
                this.createReps({ newReps })
            }

            if (currentReps.length) {
                this.updateReps({ currentReps })
            }

            if (tagsUpdated) {
                this.updateRepresentativeTags(representativeTags)
            }
        })
    }

    createReps(reps: any) {
        this.repsService.create({ entity: reps })
            .subscribe(
                (res) => {
                    const { invalidReps } = res
                    this.admin.openSnackBar('Reps added successfully', 'OK')
                    if (invalidReps.length) {
                        setTimeout(() => {
                            const message = `These emails could not be created as reps, ${invalidReps.join(', ')}.`
                            this.admin.openSnackBar(message, 'OK')
                        }, 5000)
                    }
                },
                (err) => err
            )
    }

    updateReps(reps: any) {
        this.repsService.updateMany({ entity: reps })
            .subscribe(
                (res) => {
                    const message = 'Update Successfull.'
                    this.admin.openSnackBar(message, 'OK')
                },
                (err) => {
                    this.admin.openSnackBar(err.message, 'OK')
                }
            )
    }

    deleteReps(reps: any) {
        this.repsService.deleteMany({ entity: reps })
            .subscribe(
                (res) => {
                    let message = 'Rep successfully removed'
                    if (res.length > 1) {
                        message = 'Rep\'s successfully removed'
                    }
                    this.admin.openSnackBar(message, 'OK')
                },
                (err) => err
            )
    }

    updateRepresentativeTags(tags: any) {
        // API request only takes representativeTags
        // rest of organization object passed for type matching on service
        const organization = {
            ...this.organization,
            representativeTags: tags
        }
        return this.organizationService.patch({ id: this.organization._id, entity: organization })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    tagSelected(event: any) {
        const selectedItem = event.option.value.trim()
        if (this.allTags.includes(selectedItem)) {
            this.tags.push(selectedItem)
            this.tagInput.nativeElement.value = ''
        }
    }

    filterReps(reps: any[], tagName: string) {
        if (!reps || !reps.length) return []
        const filteredReps = reps.filter((rep: any) => {
            const { tags = [] } = rep
            if (!tags.length) return false
            return tags.some((tag: any) => {
                return tag === tagName
            })
        })
        return filteredReps
    }

    tagRemoved(tagName: string) {
        const index = this.tags.indexOf(tagName)

        if (index >= 0) {
            this.tags.splice(index, 1)
        }
    }

    private _filter(tagName: any): any[] {
        return this.allTags.filter(tag => tag !== tagName)
    }

    // private _filter(tagName: any): any[] {

    //     const filterVal = this.allReps.filter(rep => {
    //         if (!rep) return false
    //         const { representativeTags = [] } = rep;
    //         if (representativeTags.length) return false
    //         return representativeTags.find((tag: any) => {
    //             return tag.name === tagName
    //         })
    //     })
    //     return filterVal
    // }
}
