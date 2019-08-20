import { Injectable } from '@angular/core';
import * as Msal from 'msal';
import { TokenService } from './token.service';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from 'src/app/models/auth-user';

// MSDN: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview
// Read: https://www.npmjs.com/package/msal
// Wiki: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-options

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userChangeSubject = new BehaviorSubject(new AuthUser());
  public user = this.userChangeSubject.asObservable();
  private B2cScopes = ['https://davidyatesB2CTenant.onmicrosoft.com/learning/Hello.ReadWrite'];
  private msalConfig: Msal.Configuration = {
    auth: {
      clientId: 'e9a5e449-fd52-4faf-91cd-ad1e582c2c79', // This is your client ID
      authority: 'https://login.microsoftonline.com/tfp/davidyatesB2CTenant.onmicrosoft.com/B2C_1_Google_Only', // This is your tenant info
      navigateToLoginRequestUrl: false
      // redirectUri: 'https://localhost:4200'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  };
  private clientApplication: Msal.UserAgentApplication = new Msal.UserAgentApplication(this.msalConfig);

  constructor(private tokenService: TokenService) {
    this.clientApplication.handleRedirectCallback(this.redirectCallback);
    if (this.isAuthenticated()) {
      this.userChangeSubject.next(this.getUser());
    }
  }

  public isAuthenticated(): boolean {
    if (this.clientApplication === undefined || this.clientApplication === null) {
      return false;
    }

    const account: Msal.Account = this.clientApplication.getAccount();
    if (account && account.idToken && account.idToken.exp) {
      const expirationInMilliseconds: number = +account.idToken.exp * 1000;
      const timeRightNowInMilliseconds = new Date().getTime();
      return expirationInMilliseconds > timeRightNowInMilliseconds;
    }

    // If the account doesn't exist or we can't acesss the idToken, the user is either NOT logged on
    return false;
  }

  public isLoginInProgress(): boolean {
    return this.clientApplication.getLoginInProgress();
  }

  public getTokenExpirationDate(): Date {
    const account: Msal.Account = this.clientApplication.getAccount();
    if (account && account.idToken && account.idToken.exp) {
      const expirationInMilliseconds: number = +account.idToken.exp * 1000;
      return new Date(expirationInMilliseconds);
    }
    return new Date(0);
  }

  public getUser(): AuthUser {
    const user = new AuthUser();
    let account: Msal.Account;
    if (this.clientApplication) {
      account = this.clientApplication.getAccount();
    }

    if (account && account.idToken) {
      if (account.idToken.emails && account.idToken.emails.length > 0) {
        user.email = account.idToken.emails[0];
      }
      user.firstName = account.idToken.given_name;
      user.lastName = account.idToken.family_name;
    }

    return user;
  }

  public login(): void {
    console.log('Auth: Login called.');
    // Reading:
    // Base documention: https://github.com/AzureAD/microsoft-authentication-library-for-js
    // Example of improvements with new MSAL library: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#signing-in-and-getting-tokens-with-msaljs
    const account: Msal.Account = this.clientApplication.getAccount();

    if (account) {
      // User is already logged in ...attempt silent token acquisition
      this.getTokenSilently();
    } else {
      // User is not logged in, you will need to log them in to acquire a token
      this.getTokenViaLoginRedirect();
    }
  }

  public logout(): void {
    this.clientApplication.logout();
    this.tokenService.removeAccessToken();
  }

  private getTokenSilently() {
    console.log('Auth: getTokenSilently called.');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: this.B2cScopes };

    this.clientApplication.acquireTokenSilent(tokenRequest)
      .then(response => {
        console.log('Auth: getTokenSilently promise returns.', response);
        this.tokenService.saveAccessToken(response.accessToken);
        this.userChangeSubject.next(this.getUser());
      })
      .catch(err => {
        // could also check if err instance of InteractionRequiredAuthError if you can import the class.
        if (err.name === 'InteractionRequiredAuthError') {
          this.getTokenViaLoginRedirect();
        }
      });
  }

  private redirectCallback(error, response) {
    if (error) {
      console.log('Auth: redirectCallback called with error.', error);
    } else {
      if (response.accessToken) {
        console.log('Auth: redirectCallback called with response AND an access token.', response);
      } else {
        console.log('Auth: redirectCallback called with response WITHOUT an access token.', response);
      }
    }
  }

  private getTokenViaLoginRedirect() {
    console.log('Auth: getTokenViaLoginRedirect called');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: this.B2cScopes };
    this.clientApplication.loginRedirect(tokenRequest);
  }
}
