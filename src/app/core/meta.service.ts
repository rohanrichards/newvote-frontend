import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { OrganizationService } from '@app/core/http/organization/organization.service';
import { Organization } from '@app/core/models/organization.model';

export interface UpdateContext {
	title: string;
	description: string;
	image: string;
}

@Injectable()
export class MetaService {
	appName: string;
	pageTitle: string;
	appDescription: string;
	appType = 'website';
	appUrl = 'newvote.org';
	appImage = '';
	appTwitterHandle = '@NewVoteAus';
	organization: Organization;

	constructor(private meta: Meta, private title: Title, private organizationService: OrganizationService) {
		this.appName = 'NewVote';
		this.pageTitle = 'Home';
		this.appDescription = 'NewVote is a democracy app, and it’s all about you.\
			Our mission is to rebuild the relationship between everyday people and \
			their leaders, so that we all have confidence in our democracies and the \
			decisions they make.';

		this.createTags();
		this.title.setTitle(`${this.pageTitle} - ${this.appName}`);

		this.organizationService.get().subscribe(org => {
			this.organization = org;
			this.appUrl = `${this.organization.url}.${this.appUrl}`;
			this.appName = this.organization.name;
			this.appDescription = this.organization.description;
			this.appImage = this.organization.imageUrl;

			this.updateTags({ title: this.pageTitle, description: this.appDescription, image: this.appImage });
		});
	}

	createTags() {
		this.meta.addTags([
			{
				'description': this.appDescription,
				'og:title': this.appName,
				'og:description': this.appDescription,
				'og:type': this.appType,
				'og:url': this.appUrl,
				'og:image': this.appImage
			}
		]);
	}

	updateTags(context: UpdateContext) {
		const title = `${context.title} - ${this.appName}`;
		this.title.setTitle(title);
		this.meta.updateTag({ 'description': context.description });
		this.meta.updateTag({ 'og:title': title });
		this.meta.updateTag({ 'og:description': context.description });
		this.meta.updateTag({ 'og:image': context.image });
	}

}
