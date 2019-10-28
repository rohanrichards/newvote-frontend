import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { FlexLayoutModule } from '@angular/flex-layout'
import { Angulartics2Module } from 'angulartics2'

import { CoreModule } from '@app/core'
import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image'
import { JoyrideModule } from 'ngx-joyride'

import { FeedRoutingModule } from './feed-routing.module'
import { FeedComponent } from './feed.component'

@NgModule({
    declarations: [
        FeedComponent
    ],
    imports: [
        CommonModule,
        FeedRoutingModule,
        CommonModule,
        CoreModule,
        SharedModule,
        FlexLayoutModule,
        MaterialModule,
        Angulartics2Module,
        LazyLoadImageModule.forRoot({
            preset: intersectionObserverPreset
        })
    ]
})
export class FeedModule { }
