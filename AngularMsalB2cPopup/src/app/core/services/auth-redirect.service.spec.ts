import { TestBed } from '@angular/core/testing';

import { AuthRedirectService } from './auth-redirect.service';
import { RouterTestingModule } from '@angular/router/testing';
import { WelcomeComponent } from 'src/app/components/welcome/welcome.component';

describe('AuthRedirectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [WelcomeComponent],
    imports: [RouterTestingModule.withRoutes(
      [{ path: 'welcome', component: WelcomeComponent }]
    )],
  }));

  it('should be created', () => {
    const service: AuthRedirectService = TestBed.get(AuthRedirectService);
    expect(service).toBeTruthy();
  });

  it('should ignore a route', () => {
    // Arrange
    const service: AuthRedirectService = TestBed.get(AuthRedirectService);
    service.addIgnoreRoutes(['/login', '/logout', '/user/address', undefined, null]);

    // Assert
    expect(service.isIgnoredRoute('/login')).toBeTruthy('Did not ignore /login');
    expect(service.isIgnoredRoute('/Login')).toBeTruthy('Did not ignore /Login');
    expect(service.isIgnoredRoute('/user/address')).toBeTruthy('Did not ignore /user/address');
    expect(service.isIgnoredRoute(null)).toBeTruthy('Did not ignore null');
    expect(service.isIgnoredRoute(undefined)).toBeTruthy('Did not ignore undefined');

    expect(service.isIgnoredRoute('/user')).toBeFalsy();
    expect(service.isIgnoredRoute('/king')).toBeFalsy();
  });

  it('can clear ignored routes', () => {
    // Arrange
    const service: AuthRedirectService = TestBed.get(AuthRedirectService);
    service.addIgnoreRoutes(['/login', '/logout', '/user/address']);
    expect(service.isIgnoredRoute('/login')).toBeTruthy();

    // Act
    service.clearIgnoreddRoute();

    // Assert
    expect(service.isIgnoredRoute('/login')).toBeFalsy();
  });


  it('should ignore a route', () => {
    // Arrange
    const service: AuthRedirectService = TestBed.get(AuthRedirectService);
    service.addIgnoreRoutes(['/login', '/logout', 'user/address']);
    spyOn(service, 'getPartialPath').and.returnValue('/login');

    // Act
    service.saveCurrentRoute();

    // Assert
    expect(service.getPartialPath).toHaveBeenCalled();
    expect(service.getSavedRoute(true)).toEqual('/', 'The login route should have been ignored!');
  });

  it('should find a good route', () => {
    // Arrange
    const service: AuthRedirectService = TestBed.get(AuthRedirectService);
    service.addIgnoreRoutes(['/login', '/logout', 'user/address']);
    spyOn(service, 'getPartialPath').and.returnValue('/user');

    // Act
    service.saveCurrentRoute();

    // Assert
    expect(service.getPartialPath).toHaveBeenCalled();
    expect(service.getSavedRoute(true)).toEqual('/user', '/user is a valid route that is not being ignored!');
  });


});
