import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonButtonComponent } from './skeleton-button.component';

describe('SkeletonButtonComponent', () => {
  let component: SkeletonButtonComponent;
  let fixture: ComponentFixture<SkeletonButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletonButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
