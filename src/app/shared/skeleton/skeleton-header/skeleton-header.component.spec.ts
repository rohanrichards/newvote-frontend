import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SkeletonHeaderComponent } from './skeleton-header.component'

describe('SkeletonHeaderComponent', () => {
    let component: SkeletonHeaderComponent
    let fixture: ComponentFixture<SkeletonHeaderComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SkeletonHeaderComponent]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(SkeletonHeaderComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
