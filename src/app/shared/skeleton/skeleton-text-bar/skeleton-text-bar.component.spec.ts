import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SkeletonTextBarComponent } from './skeleton-text-bar.component'

describe('SkeletonTextBarComponent', () => {
    let component: SkeletonTextBarComponent
    let fixture: ComponentFixture<SkeletonTextBarComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SkeletonTextBarComponent]
        })
            .compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(SkeletonTextBarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
