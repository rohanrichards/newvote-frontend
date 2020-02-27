import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeInfoPanelComponent } from './home-info-panel.component';

describe('HomeInfoPanelComponent', () => {
  let component: HomeInfoPanelComponent;
  let fixture: ComponentFixture<HomeInfoPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeInfoPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
