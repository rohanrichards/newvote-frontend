import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepModalComponent } from './rep-modal.component';

describe('RepModalComponent', () => {
  let component: RepModalComponent;
  let fixture: ComponentFixture<RepModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
