/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { sensitiveHeaders } from "node:http2";
import { z, ZodObject, ZodTypeAny } from "zod";
import {
  rawUserSchema,
  UnknownKeysParam,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { MyRequest, requestHandler } from "../../express.js";
import { client } from "./openid-client.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";

export async function openidRedirectHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler("GET", "/api/v1/redirect", async function () {
    const url = new URL(request.url!, "https://localhost:8443");

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

      const dbUser = pickFn(rawUserSchema).parse(
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
        location: "/",
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
  })(request, response);
}
