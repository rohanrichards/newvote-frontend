import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';
import { OwnerGuard } from '@app/core/authentication/owner.guard';

import { extract } from '@app/core';
import { IssueListComponent } from './list/issue-list.component';
import { IssueViewComponent } from './view/issue-view.component';
import { IssueCreateComponent } from './create/issue-create.component';
import { IssueEditComponent } from './edit/issue-edit.component';

const routes: Routes = [
	{ path: '', component: IssueListComponent, data: { title: extract('All Issues') } },
	{
		path: 'create',
		component: IssueCreateComponent,
		data: { title: extract('New Issue') },
		canActivate: [OwnerGuard]
	},
	{
		path: 'edit/:id',
		component: IssueEditComponent,
		data: { title: extract('Edit Issue') },
		canActivate: [OwnerGuard]
	},
	{
		path: ':id',
		component: IssueViewComponent,
		data: { title: extract('Issue') }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class IssueRoutingModule { }
