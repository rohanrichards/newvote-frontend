import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { Observable } from 'rxjs';
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
    proposals: Proposal[];
    solutions: Solution[];
    issues: Issue[];
    suggestions: Suggestion[];
    organization: Organization;

    tagCtrl = new FormControl('')
    allTags: any[];
    allReps: any[];
    tags: string[] = []
    filteredTags: Observable<any[]>;
    filteredReps: Observable<any[]>;
    selectedTags: Array<any> = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];

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
        private organizationService: OrganizationService
    ) {
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
            startWith(''),
            map((tagName: string) => {
                return tagName ? this._filter(tagName) : this.allTags.slice()
            })
        )
    }

    ngOnInit() {
        this.fetchData()
        this.subscribeToOrgStore()
        // this.subscribeToProposalStore()
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
                },
                (err) => err
            )
    }

    // subscribeToProposalStore() {
    //     this.proposals$ = this.proposalQuery.selectAll({})
    // }

    fetchData() {
        const isModerator = this.auth.isModerator()
        // this.isLoading = true
        const params = { softDeleted: isModerator ? true : '' }

        this.proposalService.list({ orgs: [], params })
            .subscribe((res) => res)

        this.repsService.list({ orgs: [], params })
            .subscribe((res) => {
                this.subscribeToRepStore()
            })

        this.solutionService.list({ orgs: [], params })
            .subscribe((res) => res)

        this.issueService.list({ orgs: [], params })
            .subscribe((res) => res)
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
                this.createReps({ newReps, currentReps })
            }

            if (tagsUpdated) {
                this.updateRepresentativeTags(representativeTags)
            }
        })
    }

    createReps(reps: any) {
        this.repsService.create({ entity: reps })
            .subscribe(
                (res) => res,
                (err) => err
            )
    }

    deleteReps(reps: any) {
        this.repsService.deleteMany({ entity: reps })
            .subscribe(
                (res) => res,
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
        if (!reps.length) return false
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
