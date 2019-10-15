import { Component, OnInit } from '@angular/core'
import { OrganizationService, AuthenticationService } from '@app/core'
import { Organization } from '@app/core/models/organization.model'
import { StateService } from '@app/core/http/state/state.service'
import { AppState } from '@app/core/models/state.model'
import { CommunityQuery } from '@app/core/http/organization/organization.query'
import { Observable } from 'rxjs'

@Component({
    selector: 'app-communities',
    templateUrl: './communities.component.html',
    styleUrls: ['./communities.component.scss']
})
export class CommunitiesComponent implements OnInit {
	organizations: Organization[];
	organizations$: Observable<Organization[]>;

	constructor(
		private organizationService: OrganizationService,
		private auth: AuthenticationService,
		private state: StateService,
		private communityQuery: CommunityQuery
	) { }

	ngOnInit() {
	    this.subscribeToCommunitiesStore()
	    this.fetchData(true)
	}

	fetchData(force?: boolean) {
	    const isAdmin = this.auth.isAdmin()

	    this.organizationService.list({
	        params: {
	            showDeleted: isAdmin ? 'true' : '',
	            showPrivate: isAdmin ? 'true' : 'false'
	        }
	    })
	        .subscribe(
	            res => res,
	            (error) => error
	        )
	}

	subscribeToCommunitiesStore() {
	    const isAdmin = this.auth.isAdmin()

	    this.organizations$ = this.communityQuery.selectAll({
	        filterBy: (entity) => isAdmin ? true : entity.privateOrg === false
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
	    return index // or item.id
	}
}
