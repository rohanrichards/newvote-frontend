import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { MetaService } from '@app/core/meta.service';

import { IOrganization, Organization } from '@app/core/models/organization.model';
import { Vote } from '@app/core/models/vote.model';
import { StateService } from '@app/core/http/state/state.service';
import { AppState } from '@app/core/models/state.model';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-list.component.html',
	styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {

	organizations: Array<any>;
	isLoading: boolean;
	headerTitle = 'Explore Communities';
	headerText = 'Discover other Organizations on NewVote';
	headerButtons = [{
		text: 'New Organization',
		color: 'warn',
		routerLink: '/communities/create',
		role: 'admin'
	}];
	loadingState: string;

	constructor(
		private stateService: StateService,
		private organizationService: OrganizationService,
		private voteService: VoteService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.stateService.loadingState$.subscribe((state: string) => {
			this.loadingState = state;
		});

		this.route.queryParamMap.subscribe(params => {
			const force: boolean = !!params.get('forceUpdate');
			this.fetchData(force);
		});
		this.meta.updateTags(
			{
				title: 'All Communities',
				description: 'The list of all available communities on the NewVote platform.'
			});
	}

	fetchData(force?: boolean) {
		const isAdmin = this.auth.isAdmin();
		this.stateService.setLoadingState(AppState.loading);

		this.organizationService.list({
			orgs: [],
			forceUpdate: force,
			params: {
				'showDeleted': isAdmin ? 'true' : '',
				'showPrivate': isAdmin ? 'true' : ''
			}
		})
		.subscribe(
			organizations => {
				this.organizations = organizations;
				return this.stateService.setLoadingState(AppState.complete);
			},
			(error) => {
				return this.stateService.setLoadingState(AppState.serverError);
			}
		);
	}

	onDelete(event: any) {
		this.organizationService.delete({ id: event._id }).subscribe(() => {
			console.log('done');
			this.fetchData(true);
		});
	}

	onSoftDelete(event: any) {
		if (!this.auth.isOwner()) {
			return false;
		}
		event.softDeleted = true;
		this.organizationService.update({ id: event._id, entity: event }).subscribe(() => {
			this.fetchData(true);
		});
	}

	onRestore(event: any) {
		if (!this.auth.isOwner()) {
			return false;
		}
		event.softDeleted = false;
		this.organizationService.update({ id: event._id, entity: event }).subscribe(() => {
			this.fetchData(true);
		});
	}

}
