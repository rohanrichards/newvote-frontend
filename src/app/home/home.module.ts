import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { Angulartics2Module } from 'angulartics2'

import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { HomeRoutingModule } from './home-routing.module'
import { HomeComponent } from './home.component'

import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image'
import { JoyrideModule } from 'ngx-joyride';
import { HomeInfoPanelComponent } from './components/home-info-panel/home-info-panel.component';
import { FooterComponent } from './components/footer/footer.component';
import { IssuesPanelComponent } from './components/issues-panel/issues-panel.component'
import { RouterModule } from '@angular/router'

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        SharedModule,
        FlexLayoutModule,
        MaterialModule,
        Angulartics2Module,
        HomeRoutingModule,
        RouterModule,
        JoyrideModule.forChild(),
        LazyLoadImageModule.forRoot({
            preset: intersectionObserverPreset
        })
    ],
    declarations: [
        HomeComponent,
        HomeInfoPanelComponent,
        FooterComponent,
        IssuesPanelComponent,
    ],
    providers: [
    ]
})
export class HomeModule { }
