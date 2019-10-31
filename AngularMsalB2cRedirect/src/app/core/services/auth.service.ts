import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from 'src/app/models/auth-user';
import { Router } from '@angular/router';
import { MsalRedirectHelperService } from './msal-redirect-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userChangeSubject = new BehaviorSubject(new AuthUser(null));
  public user = this.userChangeSubject.asObservable();

  constructor(private router: Router, private msalHelper: MsalRedirectHelperService) {
    this.msalHelper.clientApplication.handleRedirectCallback(this.redirectCallback.bind(this));
    if (this.hasTokenExpired() === false) {
      this.userChangeSubject.next(this.getUser());
    }
  }

  public logout(): void {
    console.log('Auth: logout called');

    this.msalHelper.logout();
  }

  public getAccessToken(): string {
    return this.msalHelper.getAccessToken();
  }

  public getAccessTokenExpirationDate(): Date {
    return this.msalHelper.getAccessTokenExpirationDate();
  }

  public getUser(): AuthUser {
    const claims: any = this.msalHelper.getClaims();
    console.log(claims);
    return new AuthUser(claims);
  }

  public hasTokenExpired(): boolean {
    return this.msalHelper.hasTokenExpired();
  }

  public isLoginInProgress(): boolean {
    return this.msalHelper.isLoginInProgress();
  }

  public isHandlingRedirectAfterLogin(): boolean {
    return this.msalHelper.isHandlingRedirectAfterLogin();
  }

  public login(): void {
    // Reading:
    // Base documention: https://github.com/AzureAD/microsoft-authentication-library-for-js
    // Example of improvements with new MSAL library: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#signing-in-and-getting-tokens-with-msaljs
    console.log('Auth: login called');

    // The user HAS logged on in the past and old data is still around OR
    // the users is still logged on.
    // if (account && this.isAccountStillValid(account)) {
    if (this.msalHelper.hasTokenExpired() === false) {
      // User is already logged in ...attempt silent token acquisition
      this.getAccessTokenSilently();
    } else {
      // user is not logged in, you will need to log them in to acquire a token
      this.msalHelper.loginRedirect();
    }
  }


  private getAccessTokenSilently() {
    this.msalHelper.acquireTokenSilent()
      .then(response => {
        console.log('Auth:  Silently login promise returns', response);
        this.userChangeSubject.next(this.getUser());
      })
      .catch(err => {
        // could also check if err instance of InteractionRequiredAuthError if you can import the class.
        if (err.name === 'InteractionRequiredAuthError') {
          console.log('Auth:  Acquire token with redirect');
          this.msalHelper.acquireTokenRedirect();
        }
      });
  }

  // Not called if Msal.Configuration  navigateToLoginRequestUrl is set to false!
  private redirectCallback(error: any, response: any) {
    // Usage: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-of-msaljs
    if (error) {
      console.log('Auth: redirectCallback -- error', error);
      this.router.navigate(['/logout', error.errorMessage]);
    } else {
      console.log('Auth: redirectCallback -- reponse', response);
      this.router.navigate(['/']);
    }
  }
}
