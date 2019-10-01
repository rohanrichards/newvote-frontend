import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';
import { OwnerGuard } from '@app/core/authentication/owner.guard';
import { ModeratorGuard } from '@app/core/authentication/moderator.guard';

import { extract } from '@app/core';
import { OrganizationListComponent } from './list/organization-list.component';
// import { OrganizationViewComponent } from './view/organization-view.component';
import { OrganizationCreateComponent } from './create/organization-create.component';
import { OrganizationEditComponent } from './edit/organization-edit.component';
import { OrganizationClaimComponent } from './claim/organization-claim.component';

const routes: Routes = [
    {
        path: 'claim/:id',
        component: OrganizationClaimComponent,
        data: { title: extract('Community'), level: 'child' }
    },
    {
        path: '',
        component: OrganizationListComponent,
        data: { title: extract('All Communities'), level: 'root' }
    },
    {
        path: 'create',
        component: OrganizationCreateComponent,
        data: { title: extract('New Community'), level: 'child' },
        canActivate: [AdminGuard]
    },
    {
        path: 'edit/:id',
        component: OrganizationEditComponent,
        data: { title: extract('Edit Community'), level: 'child' },
        canActivate: [OwnerGuard]
    },
    // {
    // 	path: ':id',
    // 	component: OrganizationViewComponent,
    // 	data: { title: extract('Community') },
    // 	canActivate: [AdminGuard]
    // },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class OrganizationRoutingModule { }
