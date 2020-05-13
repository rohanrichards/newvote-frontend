import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileEditComponent } from './edit/profile-edit/profile-edit.component';
import { extract } from '@app/core';
import { UserGuard } from '@app/core/authentication/user.guard';

const routes: Routes = [
    { 
        path: '',
        component: ProfileEditComponent,
        data: { title: extract('User Profile'), level: 'root' },
        canActivate: [UserGuard]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
