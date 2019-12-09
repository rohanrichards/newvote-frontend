import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { MatDialog, MatDialogRef } from '@angular/material'
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component'
import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'

import { Organization } from '@app/core/models/organization.model'
import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { ToastService } from '@app/core/toast/toast.service'

@Component({
    selector: 'app-organization',
    templateUrl: './organization-view.component.html',
    styleUrls: ['./organization-view.component.scss']
})
export class OrganizationViewComponent implements OnInit {

    organization: Organization;
    organizations: Array<Organization>;
    isLoading: boolean;
    loadingState: string;
    handleImageUrl = optimizeImage;

    constructor(
        private stateService: StateService,
        private organizationService: OrganizationService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private toast: ToastService,
        private meta: MetaService
    ) { }

    ngOnInit() {
        this.stateService.loadingState$.subscribe((state: string) => {
            this.loadingState = state
        })

        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.getOrganization(ID)
        })

    }

    getOrganization(id: string, forceUpdate?: boolean) {
        this.stateService.setLoadingState(AppState.loading)

        this.organizationService.view({ id: id, orgs: [], forceUpdate })
            .subscribe(
                (organization: Organization) => {
                    this.organization = organization
                    this.meta.updateTags(
                        {
                            title: `${organization.name} Community`,
                            description: 'Viewing a community page.'
                        })
                    return this.stateService.setLoadingState(AppState.complete)

                },
                () => {
                    this.stateService.setLoadingState(AppState.error)
                }
            )
    }

    onDelete() {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: {
                title: 'Delete Organization?',
                message: `Are you sure you want to delete ${this.organization.name}? This action cannot be undone.`
            }
        })

        dialogRef.afterClosed().subscribe((confirm: boolean) => {
            if (confirm) {
                this.organizationService.delete({ id: this.organization._id }).subscribe(() => {
                    this.toast.openSnackBar('Succesfully deleted', 'OK')
                    this.router.navigate(['/organizations'])
                })
            }
        })
    }

}
