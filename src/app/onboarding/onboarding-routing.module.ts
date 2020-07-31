import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { OnboardingComponent } from './onboarding.component'
// import { extract } from '@app/core/i18n.service'

const routes: Routes = [
    {
        path: '',
        component: OnboardingComponent,
        // data: { title: extract('Onboarding'), level: 'root' },
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class OnboardingRoutingModule {}
