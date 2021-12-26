import { sensitiveHeaders } from "node:http2";
import { sql } from "../../database.js";
import { request } from "../../express.js";
import { client } from "./openid-client.js";

export async function openidRedirectHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("GET", "/api/v1/redirect", async function () {
    let url = new URL(headers[":path"], "https://localhost:8443");

    console.log(url.searchParams.get("session_state"));
    console.log(url.searchParams.get("code"));

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration
    // USE single tenant as for all others we need permissions
    // https://portal.azure.com/

    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/login/index.json.ts
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/redirect/index.ts_old

    try {
      const result = await client.callback(
        `${"https://localhost:8443"}/api/v1/redirect`,
        {
          session_state: url.searchParams.get("session_state"),
          code: url.searchParams.get("code"),
        }
      );

      console.log(result);

      console.log(result.claims());

      //const userinfo = await client.userinfo(result, {});

      //console.log(userinfo)

      /** @type {[import("../../../lib/types").Existing<Pick<import("../../../lib/types").RawUserType, "id"|"username"|"password_hash"|"password_salt">>?]} */
      const [dbUser] =
        await sql`SELECT id, username, type FROM users WHERE openid_id = ${
          result.claims().sub
        } LIMIT 1`;

      if (dbUser === undefined) {
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            result: "failure",
            failure: {
              username: "Nutzer existiert nicht!",
            },
          },
        ];
      }

      /** @type {[Pick<import("../../../lib/types").RawSessionType, "session_id">]} */
      const [session] = await sql.begin("READ WRITE", async (sql) => {
        return await sql`INSERT INTO sessions (user_id) VALUES (${dbUser.id}) RETURNING session_id`;
      });

      /** @type {import("node:http2").OutgoingHttpHeaders} */
      const responseHeaders: import("node:http2").OutgoingHttpHeaders = {
        "content-type": "text/json; charset=utf-8",
        ":status": 302,
        location: "https://localhost:8443/",
        "set-cookie": [
          `strict_id=${
            session.session_id
          }; Secure; SameSite=Strict; HttpOnly; Max-Age=${48 * 60 * 60};`,
          `lax_id=${
            session.session_id
          }; Secure; SameSite=Lax; HttpOnly; Max-Age=${48 * 60 * 60};`,
          `username=${
            dbUser.username
          }; Secure; SameSite=Strict; Path=/; Max-Age=${48 * 60 * 60};`,
        ],
        [sensitiveHeaders]: ["set-cookie"],
      };
      return [
        responseHeaders,
        {
          result: "success",
          success: undefined,
        },
      ];
    } catch (error) {
      let _error = /** @type {Error} */ (error);
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {
          result: "failure",
          failure: {
            login: _error.message,
          },
        },
      ];
    }
  })(stream, headers);
}
