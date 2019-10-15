import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FlexLayoutModule } from '@angular/flex-layout'
import { RouterTestingModule } from '@angular/router/testing'
import { Angulartics2Module } from 'angulartics2'

import { CoreModule } from '@app/core'
import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { ProposalListComponent } from './proposal-list.component'
import { ProposalService } from '@app/core/http/proposal/proposal.service'

describe('ProposalComponent', () => {
    let component: ProposalListComponent
    let fixture: ComponentFixture<ProposalListComponent>

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
            declarations: [ProposalListComponent],
            providers: [ProposalService]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(ProposalListComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
