import { Injectable } from '@angular/core';
import { AuthUser } from 'src/app/models/auth-user';
import * as Msal from 'msal';
import { environment } from 'src/environments/environment';
import { StringDict } from 'msal/lib-commonjs/MsalTypes';
import { Router } from '@angular/router';
import { AuthRedirectService } from './auth-redirect.service';

// MSDN: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview
// Read: https://www.npmjs.com/package/msal
// Wiki: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#configuration-options

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private localStorageKey = 'msal.idtoken';
  private reloadNeeded = false;

  // configuration to initialize msal
  // Note 1: validateAuthority must be false for newer b2clogin.com authority endpoint see https://docs.microsoft.com/en-us/azure/active-directory-b2c/b2clogin
  // Note 2: Configuration options defined https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications#configuration-options
  private msalConfig: Msal.Configuration = {
    auth: {
      clientId: environment.securityClientId,
      authority: environment.securityAuthority,
      navigateToLoginRequestUrl: false,  // Only used for redirect flows
      validateAuthority: false,
      postLogoutRedirectUri: window.location.origin + '/logout', // Full URL (no partial urls, null or undefined ... if the property exists on the object it is used!)
      redirectUri: window.location.origin + '/simpsons' // Full URL (no partial urls, null or undefined!).  Important! This must be a registered URL in B2C within the Azure Portal.
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  };

  private clientApplication = new Msal.UserAgentApplication(this.msalConfig);

  constructor(private router: Router, private redirectService: AuthRedirectService) {
    redirectService.addIgnoreRoutes(['/logout']);
  }

  /**
   * Pulls the access token (JWT) from local storage
   */
  public getAccessToken(): string {
    if (localStorage.hasOwnProperty(this.localStorageKey)) {
      const token: string = localStorage.getItem(this.localStorageKey);
      if (this.isValidToken(token)) {
        return token;
      }
    }

    return null;
  }

  /**
   * Gets the expiration date and time of the access token
   */
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

  /**
   * Pulls user information from access tokens claims.
   */
  public getUser(): AuthUser {
    const claims: any = this.getClaims();
    return new AuthUser(claims);
  }

  /**
   * Indicates if the token has expired.
   */
  public hasTokenExpired(): boolean {
    const tokenExpirationDate = this.getAccessTokenExpirationDate();
    const currentDate = new Date();
    return currentDate.getTime() >= tokenExpirationDate.getTime();
  }

  /**
   * Indicates that msal.js library is in the process of handling a login.
   */
  public isLoginInProgress(): boolean {
    return this.clientApplication.getLoginInProgress();
  }

  /**
   * Used to login either silently or via popup based on the status of the access token in local storage.
   * See documention: https://github.com/AzureAD/microsoft-authentication-library-for-js
   * See example of improvements with new MSAL library: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release#signing-in-and-getting-tokens-with-msaljs
   */
  public login(): void {
    console.log('Auth: login called');
    // The user HAS logged on in the past and old data is still around OR
    // the users is still logged on.
    if (this.hasTokenExpired() === false) {
      // User is already logged in ...attempt silent token acquisition
      this.getAccessTokenSilently();
    } else {
      // user is not logged in, you will need to log them in to acquire a token
      // This avoids an unnecessary call to acquireTokenSilent
      this.loginPopup();
    }
  }

  /**
   * Logs the user out and clears access token data from local storage.
   */
  public logout(): void {
    console.log('Auth: logout called');
    this.clientApplication.logout();
    this.redirectService.clearSavedRoute();
  }

  /**
   * Used to acquire an access token.  This is called after the loginPopup OR to renew an access token.
   * If you fail to acquire an access token silently, use acquireTokenPopup to get the actual token!
   */
  private acquireAccessTokenSilent(): Promise<Msal.AuthResponse> {
    console.log('Auth: Getting token silently');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: environment.securityScopes };
    return this.clientApplication.acquireTokenSilent(tokenRequest);
  }

  /**
   * Used if there is a failure acquiring a token silently, but should only be used if the original login was initiated by loginPopup!
   * See documentation here: https://docs.microsoft.com/bs-latn-ba/azure/active-directory/develop/scenario-spa-acquire-token#acquire-token-with-a-pop-up-window
   */
  private getAccessTokenPopup() {
    console.log('Auth:  Silent renewal failed so use acquireTokenPopup!');
    const tokenRequest: Msal.AuthenticationParameters = { scopes: environment.securityScopes };
    this.clientApplication.acquireTokenPopup(tokenRequest)
      .then(response => {
        // get access token from response
        // response.accessToken
        this.reloadIfNecessary();
      })
      .catch(err => {
        // handle error
      });
  }

  /**
   * Used to acquire an access token silently and if that fails to acquire a token via a popup.
   */
  private getAccessTokenSilently() {
    this.acquireAccessTokenSilent()
      .then(response => {
        console.log('Auth:  Silently login promise returns', response);
        this.reloadIfNecessary();
      })
      .catch(err => {
        // could also check if err instance of InteractionRequiredAuthError if you can import the class.
        if (err.name === 'InteractionRequiredAuthError') {
          console.log('Auth:  Silent login failed, so acquire token with popup');
          this.getAccessTokenPopup();
        }
      });
  }

  /**
   * Gets the claim saved by the Msal.js library.
   */
  private getClaims(): StringDict {
    const account: Msal.Account = this.clientApplication.getAccount();
    return account !== null ? account.idTokenClaims : {};
  }

  /**
   * Very basic validation of a JWT token
   * @param token - A JWT represented as a string.  Should have three parts each seperated by periods.
   */
  private isValidToken(token: string) {
    return (token && token.length > 0 && token.indexOf('.') !== -1);
  }

  /**
   * Used to login.  You do NOT have a token YET.  You use acquireTokenPopup to get the token!
   * You should first attempt to get it silently, but if that fails use acquireTokenPopup.
   * Should ONLY be used in conjunction with acquireTokenPopup
   */
  private loginPopup() {
    console.log('Auth:  Get token via login popup');
    this.reloadNeeded = this.hasTokenExpired();
    this.redirectService.saveCurrentRoute();

    const tokenRequest: Msal.AuthenticationParameters = { scopes: environment.securityScopes };
    this.clientApplication.loginPopup(tokenRequest)
      .then(response => {
        console.log('Auth:  Login popup promise returns', response);
        this.getAccessTokenSilently();
      })
      .catch(err => {
        console.log('Auth: Login popup failed.', err);
        this.router.navigate(['/logout'], { queryParams: { errorMessage: err.errorMessage } });
      });
  }

  /**
   * Used after loging popup is shown.  It determines if we should reload the screen.
   * this should only be done if the token expired or doesn't exist in the first place.
   */
  private reloadIfNecessary() {
    // Navigate to login page which will redirect back to saved route.
    if (this.reloadNeeded) {
      this.reloadNeeded = false;
      this.redirectService.navigateToSavedRoute(true);
      this.redirectService.clearSavedRoute();
    }
  }
}
