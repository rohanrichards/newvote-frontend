import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FlexLayoutModule } from '@angular/flex-layout'
import { RouterTestingModule } from '@angular/router/testing'
import { Angulartics2Module } from 'angulartics2'

import { CoreModule } from '@app/core'
import { SharedModule } from '@app/shared'
import { MaterialModule } from '@app/material.module'
import { TopicCreateComponent } from './topic-create.component'
import { TopicService } from '@app/core/http/topic/topic.service'

describe('TopicComponent', () => {
    let component: TopicCreateComponent
    let fixture: ComponentFixture<TopicCreateComponent>

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
            declarations: [TopicCreateComponent],
            providers: [TopicService]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicCreateComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
