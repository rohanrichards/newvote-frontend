import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressFormComponent } from './progress-form.component';

describe('ProgressFormComponent', () => {
  let component: ProgressFormComponent;
  let fixture: ComponentFixture<ProgressFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
