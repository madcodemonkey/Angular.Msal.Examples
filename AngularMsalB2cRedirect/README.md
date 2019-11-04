# Notes on Angular Msal.js B2C Redirect Example

## Reconfigure to use your own B2C tenant
1. Azure portal
   1. Define your B2C tenant in the Azure portal 
   1. Create any identify provider relationships necessary and configure them in the B2C tenant
   1. Create a B2C application and configure it with a scope
1. In this application, update the following three values in environment.ts and environment.prod.ts
    1. securityScopes
    1. securityClientId
    1. securityAuthority

## General Notes
- You must first use a login method and THEN use an acquire method to obtain the token.
- The MSAL.js library violates the integration segregation principle by mixing both the redirect and popup methods into a single interface/object, which creates confusion about which method to use.  I try to clarify that below.  

## Redirect notes
The general idea is that your user is redirected to the B2C web site to do login. On the B2C site they are given different identity provider (IdP) choices and routed to the one of their choice. Once authenticated with the IdP, they are routed back to the B2C web site and then back to a redirect uri and an access token is available.
- If you use the **loginRedirect** method, you are ONLY logging in.  You must use the **acquireTokenSilent** method and if that fails you fall back to the **acquireTokenRedirect** to acquire an access token.
- Since the redirect method navigates you away from the web site, it has a callback that you can assign on the Msal.UserAgentApplicaiton (see the handleRedirectCallback method).  You can use this method to navigate the user back to the route they originally tried to access (assuming you stored it before in localstorage before navigating them away).   Example of setting it:    this.clientApplication.handleRedirectCallback(this.redirectCallback.bind(this));

## Configuration Notes
Msal.js has a configuration object and [Microsoft has define the properties on it here](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications); however, I've added addition comment bullets below which start with 'Yates:' and are bolded and italicized.

## Example
``` ts
private msalConfig: Msal.Configuration = {
    auth: {
      clientId: environment.securityClientId,
      authority: environment.securityAuthority,
      navigateToLoginRequestUrl: true,  
      validateAuthority: false,
      postLogoutRedirectUri: window.location.origin + '/logout',
      redirectUri: window.location.origin + '/login'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  };
```

## Properties with comments
- **clientID**: Required. The clientID of your application, you should get this from the application registration portal.  
   - **_Yates: This can be found in the B2C portal (aka application id)_**
- **authority**: Optional. A URL indicating a directory that MSAL can request tokens from.
   - **_Yates: Newer guidance suggests using the b2clogin domain instead of login.microsoftonline.com see [here for more details](https://docs.microsoft.com/en-us/azure/active-directory-b2c/b2clogin)_**
   - Default value is: https://login.microsoftonline.com/common.
   - In Azure AD, it is of the form https://<instance>/<audience>, where <instance> is the identity provider domain (for example, https://login.microsoftonline.com) and <audience> is an identifier representing the sign-in audience. This can be the following values:
      - https://login.microsoftonline.com/<tenant>- tenant is a domain associated to the tenant, such as contoso.onmicrosoft.com, or the GUID representing the TenantID property of the directory used only to sign in users of a specific organization.
	  - https://login.microsoftonline.com/common- Used to sign in users with work and school accounts or a Microsoft personal account.
	  - https://login.microsoftonline.com/organizations/- Used to sign in users with work and school accounts.
	  - https://login.microsoftonline.com/consumers/ - Used to sign in users with only personal Microsoft account (live).
   - In Azure AD B2C, it is of the form https://<instance>/tfp/<tenant>/<policyName>/, where instance is the Azure AD B2C domain, tenant is the name of the Azure AD B2C tenant, policyName is the name of the B2C policy to apply.
validateAuthority: Optional. Validate the issuer of tokens. Default is true. For B2C applications, since the authority value is known and can be different per policy, the authority validation will not work and has to be set to false.
- **redirectUri**: Optional. The redirect URI of your app, where authentication responses can be sent and received by your app. It must exactly match one of the redirect URIs you registered in the portal. Defaults to window.location.href.  
   - **_Yates: Works in conjunction with navigateToLoginRequestUrl so see notes below._**
   - **_Yates: Note the default uri because if that page is NOT listed in their redirect URLs in the B2C portal, you WILL receive an error._**
   - **_Yates: This must be a fully qualified URL, so no null, undefined or blanks here.  You just do NOT define it if you not specifying a value!_**
- **postLogoutRedirectUri**: Optional. Redirects the user to postLogoutRedirectUri after sign out. The default is redirectUri.
   - **_Yates: If you want the user sent back to some designated logout page, specify it here.  Otherwise, you are going to have to do this in code._**
   - **_Yates: This must be a fully qualified URL, so no null, undefined or blanks here.  You just do NOT define it if you not specifying a value!_**
- **navigateToLoginRequestUrl**: Optional. Ability to turn off default navigation to start page after login. Default is true. This is used only for redirect flows.  
   - **_Yates: If true, it appears to only navigate you back to the root domain path (so if you came from https://contso.com/LoveThisPage, despite what the name implies you will be routed back to https://contso.com/ (I believe this is a bug)_**
   - **_Yates: If true and your using redirect login style, the function you pass to the Msal.UserAgentApplication handleRedirectCallback method is NOT called!_**
   - **_Yates: If false, you are sent to redirectUri (see its default above) and if that page is NOT listed in their redirect URLs in the B2C portal, you WILL receive an error._**
- **cacheLocation**: Optional. Sets browser storage to either localStorage or sessionStorage. The default is sessionStorage.
   - **_Yates: The problem with the default, sessionStorage, is that if the user is popped out into a new tab for any reason they will NOT have access to the access token anymore!_**
- **storeAuthStateInCookie**: Optional. This flag was introduced in MSAL.js v0.2.2 as a fix for the authentication loop issues on Microsoft Internet Explorer and Microsoft Edge. Enable the flag storeAuthStateInCookie to true to take advantage of this fix. When this is enabled, MSAL.js will store the auth request state required for validation of the auth flows in the browser cookies. By default this flag is set to false.
- **logger**: Optional. A Logger object with a callback instance that can be provided by the developer to consume and publish logs in a custom manner. For details on passing logger object, see logging with msal.js.
- **loadFrameTimeout**: Optional. The number of milliseconds of inactivity before a token renewal response from Azure AD should be considered timed out. Default is 6 seconds.
- **tokenRenewalOffsetSeconds**: Optional. The number of milliseconds which sets the window of offset needed to renew the token before expiry. Default is 300 milliseconds.
- **navigateFrameWait**: Optional. The number of milliseconds which sets the wait time before hidden iframes navigate to their destination. Default is 500 milliseconds.
