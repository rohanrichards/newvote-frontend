import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepsCreateComponent } from './reps-create.component';

describe('RepsCreateComponent', () => {
  let component: RepsCreateComponent;
  let fixture: ComponentFixture<RepsCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
