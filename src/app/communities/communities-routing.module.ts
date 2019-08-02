import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { CommunitiesComponent } from './communities.component';

const routes: Routes = [
	{ path: '', component: CommunitiesComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class CommunitiesRoutingModule { }
