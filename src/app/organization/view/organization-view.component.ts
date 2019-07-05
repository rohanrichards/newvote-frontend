import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { IOrganization } from '@app/core/models/organization.model';
import { Organization } from '@app/core/models/organization.model';
import { Vote } from '@app/core/models/vote.model';
import { createUrl } from '@app/shared/helpers/cloudinary';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-view.component.html',
	styleUrls: ['./organization-view.component.scss']
})
export class OrganizationViewComponent implements OnInit {

	organization: Organization;
	organizations: Array<Organization>;
	isLoading: boolean;

	constructor(
		private organizationService: OrganizationService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getOrganization(ID);
		});
	}

	getOrganization(id: string, forceUpdate?: boolean) {
		this.organizationService.view({ id: id, orgs: [], forceUpdate })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((organization: Organization) => {
				this.organization = organization;
				this.meta.updateTags(
					{
						title: `${organization.name} Community`,
						description: 'Viewing a community page.'
					});
			});
	}

	onDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete Organization?`,
				message: `Are you sure you want to delete ${this.organization.name}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.organizationService.delete({ id: this.organization._id }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/organizations'], { queryParams: { forceUpdate: true } });
				});
			}
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	replaceImageUrl (url: string) {
		return createUrl(url, 'auto', 'auto');
	}

}
