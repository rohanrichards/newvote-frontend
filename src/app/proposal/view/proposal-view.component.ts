import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { IProposal } from '@app/core/models/proposal.model';
import { Proposal } from '@app/core/models/proposal.model';
import { Vote } from '@app/core/models/vote.model';
import { createUrl } from '@app/shared/helpers/cloudinary';

import { trigger } from '@angular/animations';
import { fadeIn } from '@app/shared/animations/fade-animations';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';

@Component({
	selector: 'app-proposal',
	templateUrl: './proposal-view.component.html',
	styleUrls: ['./proposal-view.component.scss'],
		animations: [
    	trigger('fadeIn', fadeIn(':enter')) 
	]
})
export class ProposalViewComponent implements OnInit {

	proposal: Proposal;
	proposals: Array<Proposal>;
	isLoading: boolean;
	loadingState: string;

	constructor(
		private stateService: StateService,
		private proposalService: ProposalService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		})

		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.getProposal(ID);
		});
	}

	getProposal(id: string, forceUpdate?: boolean) {
		this.stateService.setLoadingState(AppState.loading);

		this.proposalService.view({ id: id, orgs: [], forceUpdate })
			.subscribe(
				(proposal: Proposal) => {
					this.proposal = proposal;
					this.meta.updateTags(
						{
							title: `${this.proposal.title}`,
							appBarTitle: 'View Action',
							description: this.proposal.description,
							image: this.proposal.imageUrl
						});
					return this.stateService.setLoadingState(AppState.complete);
				},
				(error) => {
					return this.stateService.setLoadingState(AppState.serverError);
				}
			);
	}

	onVote(voteData: any) {
		this.isLoading = true;
		const { item, voteValue } = voteData;
		const vote = new Vote(item._id, 'Proposal', voteValue);
		const existingVote = item.votes.currentUser;

		if (existingVote) {
			vote.voteValue = existingVote.voteValue === voteValue ? 0 : voteValue;
		}

		this.voteService.create({ entity: vote })
			.subscribe(
				(res) => {
					this.openSnackBar('Your vote was recorded', 'OK');
					this.getProposal(this.proposal._id, true);
				},
				(error) => {
					if (error.status === 401) {
						this.openSnackBar('You must be logged in to vote', 'OK');
					} else {
						this.openSnackBar('There was an error recording your vote', 'OK');
					}
				}
			);
	}

	onDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete Proposal?`,
				message: `Are you sure you want to delete ${this.proposal.title}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.proposalService.delete({ id: this.proposal._id }).subscribe(() => {
					this.openSnackBar('Succesfully deleted', 'OK');
					this.router.navigate(['/proposals'], {queryParams: {forceUpdate: true} });
				});
			}
		});
	}

	onSoftDelete() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Remove Proposal?`,
				message: `Are you sure you want to remove ${this.proposal.title}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.proposal.softDeleted = true;
				this.proposalService.update({ id: this.proposal._id, entity: this.proposal }).subscribe(() => {
					this.openSnackBar('Succesfully removed', 'OK');
					this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
				});
			}
		});
	}

	onRestore() {
		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore Proposal?`,
				message: `Are you sure you want to restore ${this.proposal.title}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.proposal.softDeleted = false;
				this.proposalService.update({ id: this.proposal._id, entity: this.proposal }).subscribe(() => {
					this.openSnackBar('Succesfully restored', 'OK');
					this.router.navigate(['/solutions'], {queryParams: {forceUpdate: true} });
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
		if (!url) {
			return '';
		}

		return createUrl(url, 'auto', 'auto');
	}

	imageToPlaceholder(url: string) {
		if (!url) {
			return '';
		}

 		return createUrl(url, 'low', 'auto');
	}
}
