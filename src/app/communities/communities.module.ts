import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { SharedModule } from '@app/shared';
// import { FlexLayoutModule } from '@angular/flex-layout';
// import { MaterialModule } from '@app/material.module';
import { CommunitiesRoutingModule } from './communities-routing.module'
import { CommunitiesComponent } from './communities.component'
import { MaterialModule } from '@app/material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { SharedModule } from '@app/shared'
import { RouterModule } from '@angular/router'

@NgModule({
    declarations: [
        CommunitiesComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        SharedModule,
        RouterModule,
        CommunitiesRoutingModule,
    ]
})
export class CommunitiesModule { }
