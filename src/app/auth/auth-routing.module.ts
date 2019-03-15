import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { VerifyComponent } from './verify/verify.component';

const routes: Routes = [
	{ path: 'login', component: LoginComponent, data: { title: extract('Login') } },
	{ path: 'signup', component: SignupComponent, data: { title: extract('Create Account') } },
	{ path: 'verify', component: VerifyComponent, data: { title: extract('Verify Account') } }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
export class AuthRoutingModule { }
