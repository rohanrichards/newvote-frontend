import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { LazyLoadImageModule, ScrollHooks } from 'ng-lazyload-image'
import { FlexLayoutModule } from '@angular/flex-layout'
import { OnboardingComponent } from './onboarding.component'
import { MatStepperModule } from '@angular/material/stepper'

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FlexLayoutModule,
        MatStepperModule,
        MaterialModule,
        LazyLoadImageModule.forRoot(ScrollHooks),
    ],
    exports: [],
    declarations: [OnboardingComponent],
})
export class OnboardingModule {}
