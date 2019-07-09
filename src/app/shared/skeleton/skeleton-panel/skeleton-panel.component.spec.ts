import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonPanelComponent } from './skeleton-panel.component';

describe('SkeletonPanelComponent', () => {
  let component: SkeletonPanelComponent;
  let fixture: ComponentFixture<SkeletonPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkeletonPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
