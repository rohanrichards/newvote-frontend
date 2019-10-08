import { TestBed } from '@angular/core/testing';

import { SortingService } from './sorting.service';

describe('SortingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SortingService = TestBed.get(SortingService);
    expect(service).toBeTruthy();
  });
});
