import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { WelcomeComponent } from '../welcome/welcome.component';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let testBedAuthService: AuthService;
  let testRouter: Router;

  class MockAuthService extends AuthService {
    hasTokenExpired() {
      return false;
    }
  }

  beforeEach(async(() => {
    // Mocking a service: https://blog.danieleghidoli.it/2016/11/06/testing-angular-component-mock-services/
    TestBed.configureTestingModule({
      declarations: [LoginComponent, WelcomeComponent],
      imports: [RouterTestingModule.withRoutes(
        [{ path: 'welcome', component: WelcomeComponent }]
      )],
      providers: [{ provide: AuthService, useClass: MockAuthService }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    testRouter = TestBed.get(Router);
    testRouter.initialNavigation();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    testBedAuthService = TestBed.get(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Equality check', () => {
    inject([AuthService], (injectAuthService: AuthService) => {
      expect(injectAuthService).toBe(testBedAuthService);
    });
  });
});
