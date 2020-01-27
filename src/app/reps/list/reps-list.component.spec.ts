import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepsListComponent } from './reps-list.component';

describe('RepsListComponent', () => {
  let component: RepsListComponent;
  let fixture: ComponentFixture<RepsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
