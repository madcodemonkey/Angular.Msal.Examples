import { Injectable } from '@angular/core';
import * as Msal from 'msal';
import { AuthUser } from '../models/auth-user';
import { TokenService } from './token.service';
import { BehaviorSubject } from 'rxjs';

// MSDN: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview
// Read: https://www.npmjs.com/package/msal
// Wiki: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-options

@Injectable({
  providedIn: 'root'
})
export class AuthSecurityService {
  private userChangeSubject = new BehaviorSubject(this.getUser());
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
  private clientApplication: Msal.UserAgentApplication= new Msal.UserAgentApplication(this.msalConfig);

  constructor(private tokenService: TokenService) {
    this.clientApplication.handleRedirectCallback(this.redirectCallback);

   }

  public isLoginInProgress(): boolean {
    return this.clientApplication.getLoginInProgress();
  }

  public login(): void {
    // Reading:
    // Base documention: https://github.com/AzureAD/microsoft-authentication-library-for-js
    // Example of improvements with new MSAL library: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#signing-in-and-getting-tokens-with-msaljs
    let account: Msal.Account = this.clientApplication.getAccount();

    if (account) {
      // User is already logged in ...attempt silent token acquisition
      this.getTokenSilently();
    } else {
      // user is not logged in, you will need to log them in to acquire a token
      this.getTokenViaLoginRedirect();
    }
  }

  public logout(): void {
    this.clientApplication.logout();
    this.tokenService.removeAccessToken();
  }

  public isOnline(): boolean {
    return this.clientApplication.getAccount() != null;
  }

  public isAuthenticated(): boolean {
    return !this.tokenService.isTokenExpired();
  }

  public getUser(): AuthUser {
    return this.tokenService.getUser();
  }

  private getTokenSilently() {
    const tokenRequest: Msal.AuthenticationParameters = { scopes: this.B2cScopes };

    this.clientApplication.acquireTokenSilent(tokenRequest)
      .then(response => {
        // get access token via response.accessToken
        // console.log(response);
        this.tokenService.saveAccessToken(response.accessToken);
        this.userChangeSubject.next(this.tokenService.getUser());
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
      console.log(error);
    } else {
      console.log(response);
    }
  }
  private getTokenViaLoginRedirect() {
    const tokenRequest: Msal.AuthenticationParameters = { scopes: this.B2cScopes };
    this.clientApplication.loginRedirect(tokenRequest);
  }
}
