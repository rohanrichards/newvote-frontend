import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';
import { OwnerGuard } from '@app/core/authentication/owner.guard';

import { extract } from '@app/core';
// import { ProposalListComponent } from './list/proposal-list.component';
import { ProposalViewComponent } from './view/proposal-view.component';
import { ProposalCreateComponent } from './create/proposal-create.component';
import { ProposalEditComponent } from './edit/proposal-edit.component';

const routes: Routes = [
	// { path: '', component: ProposalListComponent, data: { title: extract('All Proposals') } },
	{
		path: 'create',
		component: ProposalCreateComponent,
		data: { title: extract('New Proposal') },
		canActivate: [OwnerGuard]
	},
	{
		path: 'create/:id',
		component: ProposalCreateComponent,
		data: { title: extract('New Proposal') },
		canActivate: [OwnerGuard]
	},
	{
		path: 'edit/:id',
		component: ProposalEditComponent,
		data: { title: extract('Edit Proposal') },
		canActivate: [OwnerGuard]
	},
	{
		path: ':id',
		component: ProposalViewComponent,
		data: { title: extract('Proposal') }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class ProposalRoutingModule { }
