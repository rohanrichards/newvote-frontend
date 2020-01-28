import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { RepsListComponent } from './list/reps-list.component';
import { RepsViewComponent } from './view/reps-view.component';
import { RepsEditComponent } from './edit/reps-edit.component';
import { ModeratorGuard } from '@app/core/authentication/moderator.guard';

const routes: Routes = [
    {
        path: '',
        component: RepsListComponent,
        data: { title: extract(''), level: 'root' }
    },
    {
        path: ':id',
        component: RepsViewComponent,
        data: {
            title: extract(''),
            level: 'child'
        }
    },
    {
        path: 'create',
        component: RepsEditComponent,
        data: { title: extract('New Rep'), level: 'child' },
        canActivate: [ModeratorGuard]
    },
    {
        path: 'edit/:id',
        component: RepsEditComponent,
        data: { title: extract('Edit Rep'), level: 'child' },
        canActivate: [ModeratorGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RepsRoutingModule { }
