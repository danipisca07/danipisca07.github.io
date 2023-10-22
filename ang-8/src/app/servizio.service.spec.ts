import { TestBed } from '@angular/core/testing';

import { ServizioService } from './servizio.service';

describe('ServizioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServizioService = TestBed.get(ServizioService);
    expect(service).toBeTruthy();
  });
});
