import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';

import { extract } from '@app/core';
import { OrganizationListComponent } from './list/organization-list.component';
import { OrganizationViewComponent } from './view/organization-view.component';
import { OrganizationCreateComponent } from './create/organization-create.component';
import { OrganizationEditComponent } from './edit/organization-edit.component';

const routes: Routes = [
	{ path: '', component: OrganizationListComponent, data: { title: extract('All Organizations') } },
	{
		path: 'create',
		component: OrganizationCreateComponent,
		data: { title: extract('New Organization') },
		canActivate: [AdminGuard]
	},
	{
		path: 'edit/:id',
		component: OrganizationEditComponent,
		data: { title: extract('Edit Organization') },
		canActivate: [AdminGuard]
	},
	{
		path: ':id',
		component: OrganizationViewComponent,
		data: { title: extract('Organization') }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class OrganizationRoutingModule { }
