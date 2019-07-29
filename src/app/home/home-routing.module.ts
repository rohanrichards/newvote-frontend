import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { HomeComponent } from './home.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
	Shell.childRoutes([
		{ path: 'home', redirectTo: '', pathMatch: 'full' },
		{ path: '', component: HomeComponent, data: { title: extract('NewVote') } }
	])
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class HomeRoutingModule { }
