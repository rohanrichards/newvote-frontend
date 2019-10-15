import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SkeletonWideCardComponent } from './skeleton-wide-card.component'

describe('SkeletonWideCardComponent', () => {
    let component: SkeletonWideCardComponent
    let fixture: ComponentFixture<SkeletonWideCardComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SkeletonWideCardComponent]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(SkeletonWideCardComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
