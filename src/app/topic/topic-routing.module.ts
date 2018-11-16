import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { TopicListComponent } from './list/topic-list.component';
import { TopicViewComponent } from './view/topic-view.component';
import { TopicCreateComponent } from './create/topic-create.component';

const routes: Routes = [
	{ path: '', component: TopicListComponent, data: { title: extract('All Topics') } },
	{ path: 'create', component: TopicCreateComponent, data: { title: extract('New Topic') } },
	{ path: ':id', component: TopicViewComponent, data: { title: extract('Topic') } },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class TopicRoutingModule { }
