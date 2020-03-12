import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesPanelComponent } from './issues-panel.component';

describe('IssuesPanelComponent', () => {
  let component: IssuesPanelComponent;
  let fixture: ComponentFixture<IssuesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuesPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
