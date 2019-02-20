import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';
import { OwnerGuard } from '@app/core/authentication/owner.guard';

import { extract } from '@app/core';
// import { SuggestionListComponent } from './list/suggestion-list.component';
import { SuggestionViewComponent } from './view/suggestion-view.component';
import { SuggestionCreateComponent } from './create/suggestion-create.component';
import { SuggestionEditComponent } from './edit/suggestion-edit.component';

const routes: Routes = [
	// { path: '', component: SuggestionListComponent, data: { title: extract('All Suggestions') } },
	{
		path: 'create',
		component: SuggestionCreateComponent,
		data: { title: extract('New Suggestion') },
		canActivate: [OwnerGuard]
	},
	{
		path: 'create/:id',
		component: SuggestionCreateComponent,
		data: { title: extract('New Suggestion') },
		canActivate: [OwnerGuard]
	},
	{
		path: 'edit/:id',
		component: SuggestionEditComponent,
		data: { title: extract('Edit Suggestion') },
		canActivate: [OwnerGuard]
	},
	{
		path: ':id',
		component: SuggestionViewComponent,
		data: { title: extract('Suggestion') }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class SuggestionRoutingModule { }
