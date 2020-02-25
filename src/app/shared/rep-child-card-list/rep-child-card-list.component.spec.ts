import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepChildCardListComponent } from './rep-child-card-list.component';

describe('RepChildCardListComponent', () => {
  let component: RepChildCardListComponent;
  let fixture: ComponentFixture<RepChildCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepChildCardListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepChildCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
