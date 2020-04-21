import { NgModule } from '@angular/core'
import { Routes, RouterModule, PreloadAllModules } from '@angular/router'
import { Shell } from '@app/shell/shell.service'
import { Landing } from '@app/landing/landing.service'

const routes: Routes = [
    // Landing.childRoutes([
    //     { path: '', loadChildren: 'app/communities/communities.module#CommunitiesModule' },
    // ]),
    { path: '', loadChildren: 'app/communities/communities.module#CommunitiesModule' },
    Shell.childRoutes([
        { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule' },
        { path: 'organizations', loadChildren: 'app/organization/organization.module#OrganizationModule' },
        { path: 'communities', loadChildren: 'app/home/home.module#HomeModule' }
    ]),

    // Fallback when no prior route is matched
    // { path: '**', redirectTo: '', pathMatch: 'full' }
]

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules,
        scrollPositionRestoration: 'enabled'
    })],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
