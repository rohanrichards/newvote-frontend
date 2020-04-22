import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueListSkeletonComponent } from './issue-list-skeleton.component';

describe('IssueListSkeletonComponent', () => {
  let component: IssueListSkeletonComponent;
  let fixture: ComponentFixture<IssueListSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueListSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueListSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
