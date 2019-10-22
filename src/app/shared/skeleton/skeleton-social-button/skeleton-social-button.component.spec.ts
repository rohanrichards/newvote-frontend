import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SkeletonSocialButtonComponent } from './skeleton-social-button.component'

describe('SkeletonSocialButtonComponent', () => {
    let component: SkeletonSocialButtonComponent
    let fixture: ComponentFixture<SkeletonSocialButtonComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SkeletonSocialButtonComponent]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(SkeletonSocialButtonComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
