import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonChildCardComponent } from './skeleton-child-card.component';

describe('SkeletonChildCardComponent', () => {
  let component: SkeletonChildCardComponent;
  let fixture: ComponentFixture<SkeletonChildCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletonChildCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonChildCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
