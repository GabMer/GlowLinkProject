import { TestBed } from '@angular/core/testing';

import { LightShowService } from './light-show.service';

describe('LightShowService', () => {
  let service: LightShowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightShowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
