import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepsEditComponent } from './reps-edit.component';

describe('RepsEditComponent', () => {
  let component: RepsEditComponent;
  let fixture: ComponentFixture<RepsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
