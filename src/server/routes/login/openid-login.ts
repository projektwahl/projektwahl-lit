import { request } from "../../express.js";
import { client } from "./openid-client.js";

export async function openidLoginHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("GET", "/api/v1/openid-login", async function () {
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration
    // USE single tenant as for all others we need permissions

    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/login/index.json.ts
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/redirect/index.ts_old
    const url = client!.authorizationUrl({
      redirect_uri: `${"https://localhost:8443"}/api/v1/redirect`,
      scope: "openid email profile",
    });

    console.log(url);

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const headers: import("node:http2").OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 302,
      location: url,
    };
    return [
      headers,
      {
        success: true,
        data: undefined,
      },
    ];
  })(stream, headers);
}
