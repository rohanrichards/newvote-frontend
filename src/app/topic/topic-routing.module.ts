import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ModeratorGuard } from '@app/core/authentication/moderator.guard'

import { extract } from '@app/core'
import { TopicListComponent } from './list/topic-list.component'
import { TopicViewComponent } from './view/topic-view.component'
import { TopicCreateComponent } from './create/topic-create.component'
import { TopicEditComponent } from './edit/topic-edit.component'

const routes: Routes = [
    {
        path: '',
        component: TopicListComponent,
        data: { title: extract('All Topics'), level: 'root' },
        canActivate: [ModeratorGuard]
    },
    {
        path: 'create',
        component: TopicCreateComponent,
        data: { title: extract('New Topic'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: 'edit/:id',
        component: TopicEditComponent,
        data: { title: extract('Edit Topic'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: ':id',
        component: TopicViewComponent,
        data: { title: extract('Topic'), level: 'child' }
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class TopicRoutingModule { }
