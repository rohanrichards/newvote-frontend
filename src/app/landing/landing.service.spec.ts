import { TestBed } from '@angular/core/testing';

import { Landing } from './landing.service';

describe('LandingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Landing = TestBed.get(Landing);
    expect(service).toBeTruthy();
  });
});
