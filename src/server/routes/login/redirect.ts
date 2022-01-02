import { sensitiveHeaders } from "node:http2";
import { objectUtil, z, ZodObject, ZodTypeAny } from "zod";
import {
  rawUserHelperOrAdminSchema,
  rawUserSchema,
  rawUserVoterSchema,
  UnknownKeysParam,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { request } from "../../express.js";
import { client } from "./openid-client.js";

export async function openidRedirectHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  return await request("GET", "/api/v1/redirect", async function () {
    let url = new URL(headers[":path"]!, "https://localhost:8443");

    const searchParams = z
      .object({
        session_state: z.string(),
        code: z.string(),
      })
      .parse(Object.fromEntries(url.searchParams as any));

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration
    // USE single tenant as for all others we need permissions
    // https://portal.azure.com/

    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/login/index.json.ts
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/redirect/index.ts_old

    try {
      const result = await client!.callback(
        `${"https://localhost:8443"}/api/v1/redirect`,
        searchParams
      );

      console.log(result);

      console.log(result.claims());

      //const userinfo = await client.userinfo(result, {});

      //console.log(userinfo)

      const pickFn = <
        T extends { [k: string]: ZodTypeAny },
        UnknownKeys extends UnknownKeysParam = "strip",
        Catchall extends ZodTypeAny = ZodTypeAny
      >(
        s: ZodObject<T, UnknownKeys, Catchall>
      ) =>
        s.pick({
          id: true,
          username: true,
          password_hash: true,
        });

      const dbUser = rawUserSchema(
        pickFn(rawUserVoterSchema),
        pickFn(rawUserHelperOrAdminSchema)
      ).parse(
        (
          await sql`SELECT id, username, type FROM users WHERE openid_id = ${
            result.claims().sub
          } LIMIT 1`
        )[0]
      );

      if (dbUser === undefined) {
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            success: false,
            error: {
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
          }; Secure; SameSite=Strict; Path=/; HttpOnly; Max-Age=${
            48 * 60 * 60
          };`,
          `lax_id=${
            session.session_id
          }; Secure; SameSite=Lax;  Path=/; HttpOnly; Max-Age=${48 * 60 * 60};`,
          `username=${
            dbUser.username
          }; Secure; SameSite=Strict; Path=/; Max-Age=${48 * 60 * 60};`,
        ],
        [sensitiveHeaders]: ["set-cookie"],
      };
      return [
        responseHeaders,
        {
          success: true,
          data: {},
        },
      ];
    } catch (error) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {
          success: false,
          error: {
            login: `${error}`,
          },
        },
      ];
    }
  })(stream, headers);
}
