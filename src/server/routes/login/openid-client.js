
// OPENID_URL=https://login.microsoftonline.com/e92856e2-3074-46ed-a008-cf3da07639d1/v2.0 CLIENT_ID=0d214c62-06cc-4122-b448-55e18cca42c4

import { Issuer } from "openid-client";

if (!process.env['OPENID_URL']) {
  console.error("OPENID_URL not set!")
  process.exit(1);
}

if (!process.env['CLIENT_ID']) {
  console.error("CLIENT_ID not set!")
  process.exit(1);
}

if (!process.env['CLIENT_SECRET']) {
  console.error("CLIENT_SECRET not set!")
  process.exit(1);
}

const issuer = await Issuer.discover(process.env['OPENID_URL']);
const Client = issuer.Client;
export const client = new Client({
    client_id: process.env['CLIENT_ID'],
    client_secret: process.env['CLIENT_SECRET'],
    redirect_uris: ['https://localhost:8443/api/v1/redirect'],
    response_types: ['code'],
      // id_token_signed_response_alg (default "RS256")
  // token_endpoint_auth_method (default "client_secret_basic")
});

// https://localhost:8443/api/v1/openid-login