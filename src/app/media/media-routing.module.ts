import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@app/core/authentication/admin.guard';

import { extract } from '@app/core';
import { MediaCreateComponent } from './create/media-create.component';
import { MediaEditComponent } from './edit/media-edit.component';

const routes: Routes = [
	// { path: '', component: MediaListComponent, data: { title: extract('All Medias') } },
	{
		path: 'create',
		component: MediaCreateComponent,
		data: { title: extract('New Media') },
		canActivate: [AdminGuard]
	},
	{
		path: 'create/:id', // issue id (or parent entity)
		component: MediaCreateComponent,
		data: { title: extract('Create Media') },
		canActivate: [AdminGuard]
	},
	{
		path: 'edit/:id',
		component: MediaEditComponent,
		data: { title: extract('Edit Media') },
		canActivate: [AdminGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class MediaRoutingModule { }
