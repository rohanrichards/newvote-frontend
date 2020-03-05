import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepCardChildComponent } from './rep-card-child.component';

describe('RepCardChildComponent', () => {
  let component: RepCardChildComponent;
  let fixture: ComponentFixture<RepCardChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepCardChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepCardChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
