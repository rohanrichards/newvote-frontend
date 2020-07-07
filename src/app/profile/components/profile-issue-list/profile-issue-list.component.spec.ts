import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileIssueListComponent } from './profile-issue-list.component';

describe('ProfileIssueListComponent', () => {
  let component: ProfileIssueListComponent;
  let fixture: ComponentFixture<ProfileIssueListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileIssueListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileIssueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
