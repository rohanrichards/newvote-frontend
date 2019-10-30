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
import { QuillModule } from 'ngx-quill'
import { QuillSettings } from '@app/shared/quill/quill.settings'

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
        QuillModule.forRoot(QuillSettings),
        LazyLoadImageModule.forRoot({
            preset: intersectionObserverPreset
        })
    ]
})
export class FeedModule { }
