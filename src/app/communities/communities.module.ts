import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { CoreModule } from '@app/core';
// import { SharedModule } from '@app/shared';
// import { FlexLayoutModule } from '@angular/flex-layout';
// import { MaterialModule } from '@app/material.module';
import { CommunitiesRoutingModule } from './communities-routing.module'
import { CommunitiesComponent } from './communities.component'
import { MaterialModule } from '@app/material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { SharedModule } from '@app/shared'

@NgModule({
    declarations: [
        CommunitiesComponent
    ],
    imports: [
        CommonModule,
        CommunitiesRoutingModule,
        MaterialModule,
        FlexLayoutModule,
        SharedModule
    ]
})
export class CommunitiesModule { }
