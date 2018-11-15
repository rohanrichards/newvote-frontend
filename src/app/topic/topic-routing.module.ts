import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { TopicListComponent } from './list/topic-list.component';

const routes: Routes = [
	{ path: '', component: TopicListComponent, data: { title: extract('All Topics') } }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class TopicRoutingModule { }
