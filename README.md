# Angular Examples using the MSAL.js library

# This examples are NOT complete yet!!!!!

This repository contains two examples of how to use the MSAL.js library with B2C:
1. Using Popup - Pops up a screen for you to login with rather than taking you to B2C to sign on
1. Redirect - Redirects you B2C to login and then when you come back a token is acquired.

## Certificates
I'm using self signed certificates.  You must add the crt to your trusted certificate store if you don't want to get prompted and stop the demo.  If you don't trust mine AND you have GIT installed on your PC.  You can generate your own by doing the following:

### Step 1
Put openssl on your environment path (For me, that was C:\Program Files\Git\usr\bin).  Read more about that [here](https://stackoverflow.com/a/51757939/97803).

### Step 2
Run this command.
openssl req -x509 -nodes -sha256 -days 3650 -subj "/CN=Localhost" -newkey rsa:2048 -keyout MsalExample.key -out MsalExample.crt

Here is another example from [letsencrypt.org](https://letsencrypt.org/docs/certificates-for-localhost/), but I haven't tried it:

openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")


## B2C Instructions
TODO: Show how to create the B2C application

TODO: Show hwo the create the policy that is being used for the examples