import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonSocialBarComponent } from './skeleton-social-bar.component';

describe('SkeletonSocialBarComponent', () => {
  let component: SkeletonSocialBarComponent;
  let fixture: ComponentFixture<SkeletonSocialBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletonSocialBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonSocialBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
