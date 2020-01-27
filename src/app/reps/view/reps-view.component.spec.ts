import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepsViewComponent } from './reps-view.component';

describe('RepsViewComponent', () => {
  let component: RepsViewComponent;
  let fixture: ComponentFixture<RepsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
