import { Component, OnInit } from '@angular/core'
import { finalize } from 'rxjs/operators'
import { Router, ActivatedRoute } from '@angular/router'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'

import { Organization } from '@app/core/models/organization.model'

@Component({
    selector: 'app-organization',
    templateUrl: './organization-claim.component.html',
    styleUrls: ['./organization-claim.component.scss']
})
export class OrganizationClaimComponent implements OnInit {

    organization: Array<Organization>;
    isLoading: boolean;
    headerTitle = 'Claim this community';
    headerText = 'If you believe you should be the leader of this community, \
        use the form below to create an application and we will get back to you \
        as soon as we can.';

    headerButtons: Array<any> = [];

    constructor(private organizationService: OrganizationService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        private meta: MetaService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            // debugger;
            const id = params.get('id')
            this.fetchData(id)
        })
    }

    fetchData(id: string) {
        this.isLoading = true
        this.organizationService.view({ id })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(organization => {
                this.organization = organization
                this.headerTitle = `Claim ${organization.name}`
                this.meta.updateTags(
                    {
                        title: `Claim ${organization.name}`,
                        appBarTitle: 'Claim Community',
                        description: this.headerText
                    })
            })
    }

}
