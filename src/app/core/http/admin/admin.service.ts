import { Injectable } from '@angular/core';
import { SuggestionService } from '../suggestion/suggestion.service';
import { SolutionService } from '../solution/solution.service';
import { IssueService } from '../issue/issue.service';
import { ProposalService } from '../proposal/proposal.service';
import { MediaService } from '../media/media.service';
import { OrganizationService } from '../organization/organization.service';
import { assign } from 'lodash';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { Issue } from '@app/core/models/issue.model';
import { Media } from '@app/core/models/media.model';
import { Organization } from '@app/core/models/organization.model';
import { Solution } from '@app/core/models/solution.model';
import { Suggestion } from '@app/core/models/suggestion.model';
import { Proposal } from '@app/core/models/proposal.model';



type EntityTypes = Issue | Organization | Solution | Media | Suggestion | Proposal;
type ServiceType = IssueService | SolutionService | OrganizationService | SuggestionService | ProposalService | OrganizationService | MediaService;

@Injectable({
	providedIn: 'root'
})
export class AdminService {

	entities: Array<string> = ['Issue', 'Solution', 'Proposal', 'Suggestion', 'Media', 'Organization'];

	constructor(
		private organizationService: OrganizationService,
		private issueService: IssueService,
		private solutionService: SolutionService,
		private suggestionService: SuggestionService,
		private proposalService: ProposalService,
		private mediaService: MediaService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar
	) { }
	
	getService(model: string) {
		const services: ServiceType[] = [this.issueService, this.solutionService, this.proposalService, this.suggestionService, this.mediaService, this.organizationService]
		let entityIndex = this.entities.findIndex(e => e === model);
		return <ServiceType>services[entityIndex];
	}

	onDelete(object: EntityTypes, model: string) {
		const title: String = object.name || object.title;
		const service: ServiceType = this.getService(model);

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete ${model}?`,
				message: `Are you sure you want to delete ${title}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				service.delete({ id: object._id })
					.subscribe(() => {
						this.openSnackBar('Succesfully deleted', 'OK');
						// this.router.navigate(['/issues'], { queryParams: { forceUpdate: true } });
					});
			}
		});

	}

	onSoftDelete(object: EntityTypes, model: string) {
		const title: String = object.name || object.title;
		const service: ServiceType = this.getService(model);
		const entity: EntityTypes = assign({}, object, { softDeleted: true });

		console.log(entity, 'on SoftDelete');

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Remove ${title}?`,
				message: `Are you sure you want to remove ${title}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				service.update({ id: entity._id, entity })
					.subscribe(() => {
						this.openSnackBar('Succesfully removed', 'OK');
					});
			}
		});
		
	}

	onRestore(object: EntityTypes, model: string) {
		const title: String = object.name || object.title;
		const service: ServiceType = this.getService(model);

		const entity: EntityTypes = assign({}, object, { softDeleted: false });

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore ${title}?`,
				message: `Are you sure you want to restore ${title}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {	
				service.update({ id: entity._id, entity })
					.subscribe(() => {
						this.openSnackBar('Succesfully restored', 'OK');
						// this.router.navigate(['/issues'], { queryParams: { forceUpdate: true } });
					});
			}
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right',
			verticalPosition: 'bottom',
		});
	}
}
