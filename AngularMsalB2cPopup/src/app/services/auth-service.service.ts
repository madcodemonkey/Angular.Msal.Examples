import { Injectable } from '@angular/core';
import * as Msal from 'msal';
import { AuthUser } from '../models/auth-user';
import { TokenService } from './token.service';
import { BehaviorSubject } from 'rxjs';

// Read: https://www.npmjs.com/package/msal
// Wiki: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-options

@Injectable({
  providedIn: 'root'
})
export class AuthSecurityService {
  private userChangeSubject = new BehaviorSubject(this.getUser());
  public user = this.userChangeSubject.asObservable();

  constructor(private tokenService: TokenService) { }
  private B2cScopes = ['https://davidyatesB2CTenant.onmicrosoft.com/learning/Hello.ReadWrite'];
  private msalConfig: Msal.Configuration = {
    auth: {
      clientId: 'e9a5e449-fd52-4faf-91cd-ad1e582c2c79', // This is your client ID
      authority: 'https://login.microsoftonline.com/tfp/davidyatesB2CTenant.onmicrosoft.com/B2C_1_Google_Only' // This is your tenant info
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  };

  private clientApplication = new Msal.UserAgentApplication(this.msalConfig);

  public isLoginInProgress(): boolean {
    return this.clientApplication.getLoginInProgress();
  }

  public login(): void {
    // Reading:
    // Base documention: https://github.com/AzureAD/microsoft-authentication-library-for-js
    // Example of improvements with new MSAL library: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#signing-in-and-getting-tokens-with-msaljs
    const localThis = this;
    if (this.clientApplication.getLoginInProgress()) {
      return;
    }

    const loginRequest: Msal.AuthenticationParameters = { scopes: this.B2cScopes };

    this.clientApplication.loginPopup(loginRequest)
      .then((idToken: any) => {
        const tokenRequest: Msal.AuthenticationParameters = { scopes: this.B2cScopes };

        localThis.clientApplication.acquireTokenSilent(tokenRequest)
          .then((tokenResponse) => {
            this.tokenService.saveAccessToken(tokenResponse);
            this.userChangeSubject.next(this.tokenService.getUser());
          })
          .catch((error) => {
            localThis.clientApplication.acquireTokenPopup(tokenRequest)
              .then((tokenResponse) => {
                this.tokenService.saveAccessToken(tokenResponse);
                this.userChangeSubject.next(this.tokenService.getUser());
              }).catch((error2) => {
                console.log('Error acquiring the popup:\n' + error2);
              });
          });
      })
      .catch((error) => {
        console.log('Error during login:\n' + error);
      });
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
}
