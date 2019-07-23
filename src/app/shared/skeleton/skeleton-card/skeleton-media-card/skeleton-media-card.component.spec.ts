import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonMediaCardComponent } from './skeleton-media-card.component';

describe('SkeletonMediaCardComponent', () => {
  let component: SkeletonMediaCardComponent;
  let fixture: ComponentFixture<SkeletonMediaCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletonMediaCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonMediaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
