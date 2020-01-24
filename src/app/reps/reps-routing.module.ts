import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepsComponent } from './reps.component';
import { extract } from '@app/core';

const routes: Routes = [
    {
        path: '',
        component: RepsComponent,
        data: { title: extract(''), level: 'root' }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RepsRoutingModule { }
