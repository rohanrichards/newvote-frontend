import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueSearchSkeletonComponent } from './issue-search-skeleton.component';

describe('IssueSearchSkeletonComponent', () => {
  let component: IssueSearchSkeletonComponent;
  let fixture: ComponentFixture<IssueSearchSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueSearchSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueSearchSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
