import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FlexLayoutModule } from '@angular/flex-layout'
import { RouterTestingModule } from '@angular/router/testing'
import { Angulartics2Module } from 'angulartics2'

import { CoreModule } from '@app/core'
import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { OrganizationCreateComponent } from './organization-create.component'
import { OrganizationService } from '@app/core/http/organization/organization.service'

describe('OrganizationComponent', () => {
    let component: OrganizationCreateComponent
    let fixture: ComponentFixture<OrganizationCreateComponent>

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
            declarations: [OrganizationCreateComponent],
            providers: [OrganizationService]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationCreateComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
