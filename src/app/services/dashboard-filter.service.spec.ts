import { TestBed } from '@angular/core/testing';

import { DashboardFilterService } from './dashboard-filter.service';

describe('DashboardFilterService', () => {
  let service: DashboardFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
