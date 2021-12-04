import { sensitiveHeaders } from "node:http2";
import { sql } from "../../database.js";
import { request } from "../../express.js";
import { checkPassword } from "../../password.js";
import { Issuer } from 'openid-client'
import { client } from "./openid-client.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function openidRedirectHandler(stream, headers) {
  return await request("GET", "/api/v1/redirect", async function (body) {
    let url = new URL(headers[":path"], "https://localhost:8443");

    console.log(url.searchParams.get('session_state'))
    console.log(url.searchParams.get('code'))

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration
    // USE single tenant as for all others we need permissions
    // https://portal.azure.com/
    
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/login/index.json.ts
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/redirect/index.ts_old
    const result = await client.callback(`${"https://localhost:8443"}/api/v1/redirect`, {
      session_state: url.searchParams.get('session_state'),
      code: url.searchParams.get('code'),
    });
    
    console.log(result)

    console.log(result.claims())

    //const userinfo = await client.userinfo(result, {});

    //console.log(userinfo)

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const responseHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
    };
    return [
      responseHeaders,
      {
        result: "success",
        success: undefined,
      },
    ];
  })(stream, headers);
}
