import { Component, OnInit } from '@angular/core'
import { OrganizationService, AuthenticationService } from '@app/core'
import { Organization } from '@app/core/models/organization.model'
import { CommunityQuery } from '@app/core/http/organization/organization.query'
import { Observable } from 'rxjs'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Component({
    selector: 'app-communities',
    templateUrl: './communities.component.html',
    styleUrls: ['./communities.component.scss'],
})
export class CommunitiesComponent implements OnInit {
    organizations: Organization[]
    organizations$: Observable<Organization[]>

    opened: boolean
    isVisible = false

    constructor(
        private organizationService: OrganizationService,
        private auth: AuthenticationService,
        private communityQuery: CommunityQuery,
        private authQuery: AuthenticationQuery,
    ) {}

    ngOnInit() {
        this.subscribeToCommunitiesStore()
        this.fetchData()
    }

    fetchData() {
        const isAdmin = this.authQuery.isAdmin()

        this.organizationService
            .list({
                params: {
                    showDeleted: isAdmin ? 'true' : '',
                    showPrivate: isAdmin ? 'true' : 'false',
                },
            })
            .subscribe(res => res, error => error)
    }

    subscribeToCommunitiesStore() {
        const isAdmin = this.authQuery.isAdmin()

        this.organizations$ = this.communityQuery.selectAll({
            filterBy: entity => (isAdmin ? true : entity.privateOrg === false),
        })
    }

    handleClick() {
        window.open('https://forms.gle/euRUWDLaGPAyZe2d6', '_blank')
    }

    openCommunityURL(event: any, url: string) {
        event.preventDefault()
        const { hostname } = window.location
        // separate the current hostname into subdomain and main site
        const splitHostname = hostname.split('.')
        splitHostname[0] = url

        const newHostName = splitHostname.join('.')
        window.location.href = `http://${newHostName}:${window.location.port}`
    }

    trackByFn(index: any, item: any) {
        return index || item.id // or item.id
    }

    toggleSearch(event: any) {
        this.isVisible = event || !this.isVisible
    }
}
