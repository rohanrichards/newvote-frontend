import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileEditComponent } from './edit/profile-edit/profile-edit.component';
import { extract } from '@app/core';

const routes: Routes = [
    { path: '', component: ProfileEditComponent, data: { title: extract('All Issues'), level: 'root' } },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
