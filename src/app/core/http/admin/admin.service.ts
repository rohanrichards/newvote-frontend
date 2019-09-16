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
import { Issue, IIssue } from '@app/core/models/issue.model';
import { Media, IMedia } from '@app/core/models/media.model';
import { Organization, IOrganization } from '@app/core/models/organization.model';
import { Solution, ISolution } from '@app/core/models/solution.model';
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model';
import { Proposal, IProposal } from '@app/core/models/proposal.model';
import { TopicService } from '../topic/topic.service';
import { Topic, ITopic } from '@app/core/models/topic.model';
import { Router } from '@angular/router';

type EntityTypes = Topic | Issue | Organization | Solution | Media | Suggestion | Proposal 
	| ITopic | IIssue | IOrganization | ISolution | IMedia | ISuggestion | IProposal;
type ServiceType = TopicService | IssueService | SolutionService | OrganizationService | SuggestionService | ProposalService | OrganizationService | MediaService;

@Injectable({
	providedIn: 'root'
})
export class AdminService {

	entities: Array<string> = ['Topic', 'Issue', 'Solution', 'Proposal', 'Suggestion', 'Media', 'Organization'];

	constructor(
		private organizationService: OrganizationService,
		private issueService: IssueService,
		private solutionService: SolutionService,
		private suggestionService: SuggestionService,
		private proposalService: ProposalService,
		private mediaService: MediaService,
		private topicService: TopicService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private router: Router
	) { }
	
	getService(model: string): ServiceType {
		const services: ServiceType[] = [this.topicService, this.issueService, this.solutionService, this.proposalService, this.suggestionService, this.mediaService, this.organizationService]
		let entityIndex = this.entities.findIndex(e => e === model);
		return services[entityIndex];
	}

	getTitle(object: EntityTypes): string {
		return object['title'] || object['name'];;
	}

	onDelete(object: EntityTypes, model: string, redirectRoute?: string) {
		const title: String = this.getTitle(object);
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
				let service; 
				let data = { id: object._id }
				if (model === "Topic") {
					service = this.topicService.delete(data)				
				}

				if (model === "Issue") {
					service = this.issueService.delete(data)
				}

				if (model == "Solution") {
					service = this.solutionService.delete(data)
				}

				if (model == "Proposal") {
					service = this.proposalService.delete(data)
				}
				
				if (model == "Suggestion") {
					service = this.suggestionService.delete(data)
				}

				if (model === "Media") {
					service = this.mediaService.delete(data)
				}

				if (model === "Organization") {
					service = this.organizationService.delete(data)
				}

				service.subscribe(
					(res) => {
						this.openSnackBar('Succesfully deleted', 'OK');
						if (redirectRoute) {
							this.router.navigate([`/${redirectRoute}`]);
						}
					}
				)
			}
		});

	}

	onSoftDelete(object: any, model: string, redirectRoute?: string) {
		const title: String = this.getTitle(object);

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Remove ${title}?`,
				message: `Are you sure you want to remove ${title}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				let service; 
				
				if (model === "Topic") {
					const entity: Topic = assign({}, object, { softDeleted: true });
					service = this.topicService.update({ id: entity._id, entity })				
				}

				if (model === "Issue") {
					const entity: Issue = assign({}, object, { softDeleted: true });
					service = this.issueService.update({ id: entity._id, entity })
				}

				if (model == "Solution") {
					const entity: Solution = assign({}, object, { softDeleted: true });
					service = this.solutionService.update({ id: entity._id, entity })
				}

				if (model == "Proposal") {
					const entity: Proposal = assign({}, object, { softDeleted: true });
					service = this.proposalService.update({ id: entity._id, entity })
				}
				
				if (model == "Suggestion") {
					const entity: Suggestion = assign({}, object, { softDeleted: true });
					service = this.suggestionService.update({ id: entity._id, entity })
				}

				if (model === "Media") {
					const entity: Media = assign({}, object, { softDeleted: true });
					service = this.mediaService.update({ id: entity._id, entity })
				}

				if (model === "Organization") {
					const entity: Organization = assign({}, object, { softDeleted: true });
					service = this.organizationService.update({ id: entity._id, entity })
				}

					service.subscribe(() => {
						this.openSnackBar('Succesfully removed', 'OK');

						if (redirectRoute) {
							this.router.navigate([`/${redirectRoute}`]);
						}
					});
			}
		});
		
	}

	onRestore(object: any, model: string, redirectRoute?: string) {
		const title: String = this.getTitle(object);

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore ${title}?`,
				message: `Are you sure you want to restore ${title}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				let service; 
				
				if (model === "Topic") {
					const entity: Topic = assign({}, object, { softDeleted: false });
					service = this.topicService.update({ id: entity._id, entity })				
				}

				if (model === "Issue") {
					const entity: Issue = assign({}, object, { softDeleted: false });
					service = this.issueService.update({ id: entity._id, entity })
				}

				if (model == "Solution") {
					const entity: Solution = assign({}, object, { softDeleted: false });
					service = this.solutionService.update({ id: entity._id, entity })
				}

				if (model == "Proposal") {
					const entity: Proposal = assign({}, object, { softDeleted: false });
					service = this.proposalService.update({ id: entity._id, entity })
				}
				
				if (model == "Suggestion") {
					const entity: Suggestion = assign({}, object, { softDeleted: false });
					service = this.suggestionService.update({ id: entity._id, entity })
				}

				if (model === "Media") {
					const entity: Media = assign({}, object, { softDeleted: false });
					service = this.mediaService.update({ id: entity._id, entity })
				}

				if (model === "Organization") {
					const entity: Organization = assign({}, object, { softDeleted: false });
					service = this.organizationService.update({ id: entity._id, entity })
				}

					service.subscribe(() => {
						this.openSnackBar('Succesfully removed', 'OK');

						if (redirectRoute) {
							this.router.navigate([`/${redirectRoute}`]);
						}
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
