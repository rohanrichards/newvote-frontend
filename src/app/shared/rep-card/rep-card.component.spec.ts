import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepCardComponent } from './rep-card.component';

describe('RepCardComponent', () => {
  let component: RepCardComponent;
  let fixture: ComponentFixture<RepCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
