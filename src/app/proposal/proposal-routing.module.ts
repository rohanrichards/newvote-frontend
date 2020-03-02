import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ModeratorGuard } from '@app/core/authentication/moderator.guard'

import { extract } from '@app/core'
import { ProposalListComponent } from './list/proposal-list.component'
import { ProposalViewComponent } from './view/proposal-view.component'
import { ProposalCreateComponent } from './create/proposal-create.component'
import { ProposalEditComponent } from './edit/proposal-edit.component'
import { RepOrgGuard } from '@app/core/authentication/rep-org.guard'

const routes: Routes = [
    { path: '', component: ProposalListComponent, data: { title: extract('All Proposals'), level: 'root' } },
    {
        path: 'create',
        component: ProposalCreateComponent,
        data: { title: extract('New Proposal'), level: 'child' },
        canActivate: [RepOrgGuard]
    },
    {
        path: 'create/:id',
        component: ProposalCreateComponent,
        data: { title: extract('New Proposal'), level: 'child' },
        canActivate: [RepOrgGuard]
    },
    {
        path: 'edit/:id',
        component: ProposalEditComponent,
        data: { title: extract('Edit Proposal'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: ':id',
        component: ProposalViewComponent,
        data: { title: extract('Proposal'), level: 'child' }
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class ProposalRoutingModule { }
