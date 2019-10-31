// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  securityScopes: ['https://foemanb2c.onmicrosoft.com/learning/Hello.ReadWrite'],
  securityClientId: '29c3f41f-1a4d-4f05-8838-36bf4291d3dd',
  // securityAuthority: 'https://login.microsoftonline.com/tfp/foemanb2c.onmicrosoft.com/B2C_1_For_Fun', // Older guidance
  securityAuthority: 'https://foemanb2c.b2clogin.com/foemanb2c.onmicrosoft.com/B2C_1_For_Fun',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
