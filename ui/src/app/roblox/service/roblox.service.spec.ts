import { TestBed } from '@angular/core/testing';

import { RobloxService } from './roblox.service';

describe('RobloxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RobloxService = TestBed.get(RobloxService);
    expect(service).toBeTruthy();
  });
});
