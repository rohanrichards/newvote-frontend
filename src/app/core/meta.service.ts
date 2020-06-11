import { Injectable } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'

import { Organization } from '@app/core/models/organization.model'
import { Subject } from 'rxjs'
import { OrganizationQuery } from './http/organization/organization.query'

export interface UpdateContext {
    title?: string;
    appBarTitle?: string;
    description?: string;
    image?: string;
}

interface MetaValues {
    appName: string;
    appImage: string;
    description: string;
    appType: string;
    appUrl: string;
}

@Injectable()
export class MetaService {
    defaultMeta: MetaValues = {
        appName: 'NewVote',
        description: 'NewVote is a democracy app, and it’s all about you.\
        Our mission is to rebuild the relationship between everyday people and \
        their leaders, so that we all have confidence in our democracies and the \
        decisions they make.',
        appImage: 'https://s3-ap-southeast-2.amazonaws.com/newvote.frontend.staging/assets/logo-no-text.png',
        appUrl: 'newvote.org',
        appType: 'website'
    }

    appBarTitle = 'NewVote'
    appTwitterHandle = '@NewVoteAus';
    private routeLevel = new Subject<string>();
    routeLevel$ = this.routeLevel.asObservable();

    constructor(private meta: Meta, private title: Title, private organizationQuery: OrganizationQuery) {
        this.title.setTitle(this.defaultMeta.appName)
        // this.createTags()
        // this.setOrganizationUrl()
        // this.createTags()
        // this.organizationQuery.select()
        //     .subscribe(org => {
        //         if (!org._id) return false
        //         this.organization = org
        //         this.appUrl = `${this.organization.url}.${this.appUrl}`
        //         this.appName = this.organization.name
        //         this.appDescription = this.organization.description ? this.organization.description : this.appDescription
        //         this.appImage = this.organization.imageUrl

        //         this.meta.updateTag({ name: 'og:url', content: this.appUrl })
        //         this.meta.updateTag({ property: 'og:image', content: this.appImage })
        //         this.title.setTitle(`${this.appBarTitle} | ${this.appName}`)            
        //         // this.updateTags({ title: this.pageTitle, description: this.appDescription, image: this.appImage });
            
        //     })
    }

    setOrganizationUrl(organization?: Organization) {
        if (organization) {
            this.meta.updateTag(
                { name: 'og:title', content: organization.name || this.defaultMeta.appName }
            )
            this.meta.updateTag(
                { name: 'og:url', content: organization ? `${organization.url}.${this.defaultMeta.appUrl}` : `${this.defaultMeta.appUrl}` },
            )
            return
        } 
        this.meta.addTags([
            { name: 'og:title', content: organization.name || this.defaultMeta.appName },
            { name: 'og:url', content: organization ? `${organization.url}.${this.defaultMeta.appUrl}` : `${this.defaultMeta.appUrl}` },
        ])
    }

    createTags(context?: UpdateContext) {
        const { description = this.defaultMeta.description, image = this.defaultMeta.appImage } = context
        this.meta.addTags([
            { name: 'description', content: description },
            { name: 'og:description', content: description },
            { name: 'og:type', content: this.defaultMeta.appType },
            { property: 'og:image', content: image },
            { property: 'og:image:width', content: '600' },
            { property: 'og:image:height', content: '600' },
            { property: 'twitter:image:src', content: image }
        ])
    }

    // provide no context to reset to app defaults (determined from organization)
    updateTags(context?: UpdateContext) {
        let description

        // if no context at all reset to defaults and exit
        if (!context) {
            this.title.setTitle(this.defaultMeta.appName)
            this.meta.updateTag({ name: 'og:title', content: this.defaultMeta.appName })
            this.meta.updateTag({ name: 'description', content: this.defaultMeta.description })
            this.meta.updateTag({ name: 'og:description', content: this.defaultMeta.description })
            this.meta.updateTag({ property: 'og:image', content: this.defaultMeta.appImage })
            return
        }

        const title = context.title ? `${context.title} | ${this.defaultMeta.appName || 'NewVote'}` : this.defaultMeta.appName
        const appBarTitle = context.appBarTitle ? context.appBarTitle : (context.title ? context.title : this.defaultMeta.appName)
        description = context.description ? context.description : this.defaultMeta.description
        description = description.replace(/<[^>]*>/g, '') // strip the html out
        const image = context.image ? context.image : this.defaultMeta.appImage

        this.title.setTitle(title)
        this.appBarTitle = appBarTitle
        this.meta.updateTag({ name: 'og:title', content: title })
        this.meta.updateTag({ property: 'og:image', content: image })
        this.meta.updateTag({ name: 'description', content: description })
        this.meta.updateTag({ name: 'og:description', content: description })
    }

    getAppBarTitle() {
        return this.appBarTitle
    }

    updateRouteLevel(level: string) {
        this.routeLevel.next(level)
    }

}
