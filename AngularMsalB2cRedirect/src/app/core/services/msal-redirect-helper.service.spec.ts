import { TestBed } from '@angular/core/testing';

import { MsalRedirectHelperService } from './msal-redirect-helper.service';

describe('MsalRedirectHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MsalRedirectHelperService = TestBed.get(MsalRedirectHelperService);
    expect(service).toBeTruthy();
  });
});
