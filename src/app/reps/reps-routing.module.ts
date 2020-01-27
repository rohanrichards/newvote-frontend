import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { RepsListComponent } from './list/reps-list.component';
import { RepsViewComponent } from './view/reps-view.component';

const routes: Routes = [
    {
        path: '',
        component: RepsListComponent,
        data: { title: extract(''), level: 'root' }
    },
    {
        path: '',
        component: RepsViewComponent,
        data: {
            title: extract(''),
            level: 'child'
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RepsRoutingModule { }
