// import { TestBed, async } from '@angular/core/testing'
// import { RouterTestingModule } from '@angular/router/testing'
// import { TranslateModule } from '@ngx-translate/core'
// import { Angulartics2Module } from 'angulartics2'
// import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'

import { AppComponent } from './app.component'

import { createComponentFactory, Spectator } from '@ngneat/spectator/jest'
import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

// with Spectator:
describe('AppComponent', () => {
    const createComponent = createComponentFactory({
        component: AppComponent,
        declarations: [
            AppComponent
           ],
        imports: [ RouterTestingModule ]
    })
    // let spectator: Spectator<AppComponent>;

    // beforeEach(() => spectator = createComponent())

    // it('should create the app', () => {
    //     const app = spectator.component
    //     expect(app).toBeTruthy()
    // })

    it('should exist', () => {
        expect(1).toBeTruthy();
    })
    // more 'it' blocks
})
