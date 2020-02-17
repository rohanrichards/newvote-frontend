import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonRepCardComponent } from './skeleton-rep-card.component';

describe('SkeletonRepCardComponent', () => {
  let component: SkeletonRepCardComponent;
  let fixture: ComponentFixture<SkeletonRepCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletonRepCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonRepCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
