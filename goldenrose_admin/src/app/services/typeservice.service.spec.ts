import { TestBed } from '@angular/core/testing';

import { TypeserviceService } from './typeservice.service';

describe('TypeserviceService', () => {
  let service: TypeserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
