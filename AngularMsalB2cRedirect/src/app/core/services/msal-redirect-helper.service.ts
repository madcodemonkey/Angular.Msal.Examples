import { Injectable } from '@angular/core';
import * as Msal from 'msal';
import { environment } from 'src/environments/environment';
import { StringDict } from 'msal/lib-commonjs/MsalTypes';
import { Router } from '@angular/router';

// MSDN: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview
// Read: https://www.npmjs.com/package/msal
// Wiki: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-options

@Injectable({
  providedIn: 'root'
})
export class MsalRedirectHelperService {
  private localStorageKey = 'msal.idtoken';
  private lastRouteStorageKey = 'yates.authRoute';

  // configuration to initialize msal
  // Note 1: validateAuthority must be false for newer b2clogin.com authority endpoint see https://docs.microsoft.com/en-us/azure/active-directory-b2c/b2clogin
  // Note 2: Configuration options defined https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications#configuration-options
  private msalConfig: Msal.Configuration = {
    auth: {
      clientId: environment.securityClientId,
      authority: environment.securityAuthority,
      navigateToLoginRequestUrl: false,  // If true, the user is supposed to be redirect back the url they came from (seems to only route to home).  If false, you can set it with redirectCallback below!
      validateAuthority: false,
      postLogoutRedirectUri: window.location.origin + '/logout', // Full URL (no partial urls, null or undefined ... if the property exists on the object it is used!)
      redirectUri: window.location.origin + '/login' // Full URL (no partial urls, null or undefined!).  Important! This must be a registered URL in B2C within the Azure Portal.
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  };

  public clientApplication = new Msal.UserAgentApplication(this.msalConfig);

  constructor(private router: Router) {
    this.clientApplication.handleRedirectCallback(this.redirectCallback.bind(this));
  }

  public logout() {
    this.clientApplication.logout();
  }

  // Used prior to either acquireTokenRedirect or acquireTokenPopup to get the actual token!
  public acquireTokenSilent(): Promise<Msal.AuthResponse> {
    console.log('Auth: Getting token silently');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: environment.securityScopes };
    return this.clientApplication.acquireTokenSilent(tokenRequest);
  }

  // You are ONLY logging in.  You do NOT have a token YET.  You use acquireTokenRedirect to get the token!
  // You should first attempt to get it silently, but if that fails use acquireTokenRedect.
  // Should ONLY be used in conjunction with acquireTokenRedirect
  public loginRedirect() {
    console.log('Auth:  Get token via login redirect');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: environment.securityScopes };
    this.setLastRoute();
    this.clientApplication.loginRedirect(tokenRequest);
  }

  // Used if there is a failure acquiring a token silently, but should only be used if the original login was initiated by loginRedirect!
  // https://docs.microsoft.com/bs-latn-ba/azure/active-directory/develop/scenario-spa-acquire-token#acquire-token-with-redirect
  public acquireTokenRedirect() {
    console.log('Auth:  Silent renewal failed so use acquireTokenRedirect!');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: environment.securityScopes };
    this.setLastRoute();
    this.clientApplication.acquireTokenRedirect(tokenRequest);
  }

  public getClaims(): StringDict {
    const account: Msal.Account = this.clientApplication.getAccount();
    return account !== null ? account.idTokenClaims : {};
  }

  public getAccessToken(): string {
    if (localStorage.hasOwnProperty(this.localStorageKey)) {
      const token: string = localStorage.getItem(this.localStorageKey);
      if (this.isValidToken(token)) {
        return token;
      }
    }

    return null;
  }

  public getAccessTokenExpirationDate(): Date {
    const account: Msal.Account = this.clientApplication.getAccount();
    const tokenExpirationDate = new Date(0);

    // account.idTokenClaims.exp is a NumericDate
    // See terminlogy section https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-32 where it is defined as:
    // A JSON numeric value representing the number of seconds from 1970- 01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
    if (account && account.idTokenClaims && account.idTokenClaims.exp) {
      tokenExpirationDate.setUTCSeconds(+account.idTokenClaims.exp);
      return tokenExpirationDate;
    }

    return tokenExpirationDate;
  }

  public hasTokenExpired(): boolean {
    const tokenExpirationDate = this.getAccessTokenExpirationDate();
    const currentDate = new Date();
    return currentDate.getTime() >= tokenExpirationDate.getTime();
  }

  public isLoginInProgress(): boolean {
    return this.clientApplication.getLoginInProgress();
  }

  public isHandlingRedirectAfterLogin(): boolean {
    return this.msalConfig.auth.navigateToLoginRequestUrl;
  }

  private isValidToken(token: string) {
    return (token && token.length > 0 && token.indexOf('.') !== -1);
  }

  // Used to save the last route when redirectCallback will be called.
  private setLastRoute(): void {
    // redirectCallback is only used if  Msal.Configuration's navigateToLoginRequestUrl is false!
    if (this.msalConfig.auth.navigateToLoginRequestUrl === false) {
      // Not using this.router.url because route guards stop you from getting the proper url!
      const lastRoute = window.location.pathname + window.location.search;

      // We don't want to send the user to the login or logout screens.
      if (window.location.href === this.msalConfig.auth.redirectUri ||
        window.location.href === this.msalConfig.auth.postLogoutRedirectUri) {
        localStorage.removeItem(this.lastRouteStorageKey);
      } else {
        localStorage.setItem(this.lastRouteStorageKey, lastRoute);
      }
    }
  }

  // Used to retrieve the last route when redirectCallback will be called.
  private getLastRoute(): string {
    if (localStorage.hasOwnProperty(this.lastRouteStorageKey)) {
      const lastRoute: string = localStorage.getItem(this.lastRouteStorageKey);
      return lastRoute;
    }

    return null;
  }

  // Redirects the user back to where the started.
  // This is called only if Msal.Configuration's navigateToLoginRequestUrl is false!
  private redirectCallback(error: any, response: any) {
    // Usage: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-of-msaljs
    if (error) {
      console.log('Auth: redirectCallback -- error', error);
      this.router.navigate(['/logout', error.errorMessage]);
    } else {
      const lastRoute: string = this.getLastRoute();
      console.log('Auth: redirectCallback -- reponse', response, 'last route', lastRoute);
      if (lastRoute) {
        this.router.navigateByUrl(lastRoute);
      } else {
        this.router.navigate(['/']);
      }
    }
  }


}
