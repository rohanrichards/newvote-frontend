import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';
import { OwnerGuard } from '@app/core/authentication/owner.guard';
import { ModeratorGuard } from '@app/core/authentication/moderator.guard';

import { extract } from '@app/core';
import { SolutionListComponent } from './list/solution-list.component';
import { SolutionViewComponent } from './view/solution-view.component';
import { SolutionCreateComponent } from './create/solution-create.component';
import { SolutionEditComponent } from './edit/solution-edit.component';

const routes: Routes = [
	{ path: '', component: SolutionListComponent, data: { title: extract('All Solutions') } },
	{
		path: 'create',
		component: SolutionCreateComponent,
		data: { title: extract('New Solution') },
		canActivate: [ModeratorGuard]
	},
	{
		path: 'create/:id',
		component: SolutionCreateComponent,
		data: { title: extract('New Solution') },
		canActivate: [ModeratorGuard]
	},
	{
		path: 'edit/:id',
		component: SolutionEditComponent,
		data: { title: extract('Edit Solution') },
		canActivate: [ModeratorGuard]
	},
	{
		path: ':id',
		component: SolutionViewComponent,
		data: { title: extract('Solution') }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class SolutionRoutingModule { }
