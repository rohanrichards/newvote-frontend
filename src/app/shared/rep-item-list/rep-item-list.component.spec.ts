import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepItemListComponent } from './rep-item-list.component';

describe('RepItemListComponent', () => {
  let component: RepItemListComponent;
  let fixture: ComponentFixture<RepItemListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepItemListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
