import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FlexLayoutModule } from '@angular/flex-layout'
import { RouterTestingModule } from '@angular/router/testing'
import { Angulartics2Module } from 'angulartics2'

import { CoreModule } from '@app/core'
import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { SolutionEditComponent } from './solution-edit.component'
import { SolutionService } from '@app/core/http/solution/solution.service'

describe('SolutionComponent', () => {
    let component: SolutionEditComponent
    let fixture: ComponentFixture<SolutionEditComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                FlexLayoutModule,
                MaterialModule,
                RouterTestingModule,
                Angulartics2Module.forRoot([]),
                CoreModule,
                SharedModule,
                HttpClientTestingModule
            ],
            declarations: [SolutionEditComponent],
            providers: [SolutionService]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(SolutionEditComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
