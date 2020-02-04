import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ModeratorGuard } from '@app/core/authentication/moderator.guard'

import { extract } from '@app/core'
import { SolutionListComponent } from './list/solution-list.component'
import { SolutionViewComponent } from './view/solution-view.component'
import { SolutionCreateComponent } from './create/solution-create.component'
import { SolutionEditComponent } from './edit/solution-edit.component'
import { RepOrgGuard } from '@app/core/authentication/rep-org.guard'

const routes: Routes = [
    { path: '', component: SolutionListComponent, data: { title: extract('All Solutions'), level: 'root' } },
    {
        path: 'create',
        component: SolutionCreateComponent,
        data: { title: extract('New Solution'), level: 'child' },
        canActivate: [RepOrgGuard]
    },
    {
        path: 'create/:id',
        component: SolutionCreateComponent,
        data: { title: extract('New Solution'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: 'edit/:id',
        component: SolutionEditComponent,
        data: { title: extract('Edit Solution'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: ':id',
        component: SolutionViewComponent,
        data: { title: extract('Solution'), level: 'child' }
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class SolutionRoutingModule { }
