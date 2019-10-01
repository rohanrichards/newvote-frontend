import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { OrganizationService } from '@app/core/http/organization/organization.service';
import { Organization } from '@app/core/models/organization.model';
import { Subject } from 'rxjs';

export interface UpdateContext {
    title?: string;
    appBarTitle?: string;
    description?: string;
    image?: string;
}

@Injectable()
export class MetaService {
    appName: string;
    appBarTitle: string;
    appDescription: string;
    appType = 'website';
    appUrl = 'newvote.org';
    appImage = '';
    appTwitterHandle = '@NewVoteAus';
    organization: Organization;

    private routeLevel = new Subject<string>();
    routeLevel$ = this.routeLevel.asObservable();

    constructor(private meta: Meta, private title: Title, private organizationService: OrganizationService) {
        this.appName = 'NewVote';
        this.appBarTitle = 'NewVote';
        this.appDescription = 'NewVote is a democracy app, and it’s all about you.\
			Our mission is to rebuild the relationship between everyday people and \
			their leaders, so that we all have confidence in our democracies and the \
			decisions they make.';

        console.log('meta service setting default values');
        this.createTags();
        this.title.setTitle(this.appName);

        this.organizationService.get().subscribe(org => {
            this.organization = org;
            this.appUrl = `${this.organization.url}.${this.appUrl}`;
            this.appName = this.organization.name;
            this.appDescription = this.organization.description ? this.organization.description : this.appDescription;
            this.appImage = this.organization.imageUrl;

            this.meta.updateTag({ name: 'og:url', content: this.appUrl });
            this.title.setTitle(`${this.appBarTitle} | ${this.appName}`);
            // console.log('meta service updating with org details');
            // this.updateTags({ title: this.pageTitle, description: this.appDescription, image: this.appImage });
        });
    }

    createTags() {
        this.meta.addTags([
            { name: 'description', content: this.appDescription },
            { name: 'og:title', content: this.appName },
            { name: 'og:description', content: this.appDescription },
            { name: 'og:type', content: this.appType },
            { name: 'og:url', content: this.appUrl },
            { name: 'og:image', content: this.appImage }
        ]);
    }

    // provide no context to reset to app defaults (determined from organization)
    updateTags(context?: UpdateContext) {
        let title, appBarTitle, description, image;

        // if no context at all reset to defaults and exit
        if (!context) {
            this.title.setTitle(this.appName);
            this.meta.updateTag({ name: 'og:title', content: this.appName });
            this.meta.updateTag({ name: 'description', content: this.appDescription });
            this.meta.updateTag({ name: 'og:description', content: this.appDescription });
            this.meta.updateTag({ name: 'og:image', content: this.appImage });
            return;
        }

        title = context.title ? `${context.title} | ${this.appName || 'NewVote'}` : this.appName;
        appBarTitle = context.appBarTitle ? context.appBarTitle : (context.title ? context.title : this.appName);
        description = context.description ? context.description : this.appDescription;
        description = description.replace(/<[^>]*>/g, ''); // strip the html out
        image = context.image ? context.image : this.appImage;

        this.title.setTitle(title);
        this.appBarTitle = appBarTitle;
        this.meta.updateTag({ name: 'og:title', content: title });
        this.meta.updateTag({ name: 'og:image', content: image });
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ name: 'og:description', content: description });
        window['prerenderReady'] = true;
        console.log('set prerender ready');
    }

    getAppBarTitle() {
        return this.appBarTitle;
    }

    updateRouteLevel(level: string) {
        this.routeLevel.next(level);
    }

}
