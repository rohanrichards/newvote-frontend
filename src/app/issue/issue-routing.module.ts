import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ModeratorGuard } from '@app/core/authentication/moderator.guard'

import { extract } from '@app/core'
import { IssueListComponent } from './list/issue-list.component'
import { IssueViewComponent } from './view/issue-view.component'
import { IssueCreateComponent } from './create/issue-create.component'
import { IssueEditComponent } from './edit/issue-edit.component'
import { RepGuard } from '@app/core/authentication/rep.guard'
import { RepOrgGuard } from '@app/core/authentication/rep-org.guard'

const routes: Routes = [
    { path: '', component: IssueListComponent, data: { title: extract('All Issues'), level: 'root' } },
    {
        path: 'create',
        component: IssueCreateComponent,
        data: { title: extract('New Issue'), level: 'child' },
        canActivate: [RepOrgGuard]
    },
    {
        path: 'edit/:id',
        component: IssueEditComponent,
        data: { title: extract('Edit Issue'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: ':id',
        component: IssueViewComponent,
        data: { title: extract('Issue'), level: 'child' }
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class IssueRoutingModule { }
