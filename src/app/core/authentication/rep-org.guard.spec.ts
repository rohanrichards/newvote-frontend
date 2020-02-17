import { TestBed, async, inject } from '@angular/core/testing';

import { RepOrgGuard } from './rep-org.guard';

describe('RepOrgGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RepOrgGuard]
    });
  });

  it('should ...', inject([RepOrgGuard], (guard: RepOrgGuard) => {
    expect(guard).toBeTruthy();
  }));
});
