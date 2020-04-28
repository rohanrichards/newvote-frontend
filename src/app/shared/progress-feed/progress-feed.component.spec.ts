import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressFeedComponent } from './progress-feed.component';

describe('ProgressFeedComponent', () => {
  let component: ProgressFeedComponent;
  let fixture: ComponentFixture<ProgressFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
