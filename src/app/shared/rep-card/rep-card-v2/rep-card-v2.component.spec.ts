import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepCardV2Component } from './rep-card-v2.component';

describe('RepCardV2Component', () => {
  let component: RepCardV2Component;
  let fixture: ComponentFixture<RepCardV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepCardV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepCardV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
