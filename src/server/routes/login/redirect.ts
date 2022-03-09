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
import { z, ZodIssueCode, ZodObject, ZodTypeAny } from "zod";
import {
  rawSessionType,
  rawUserSchema,
  UnknownKeysParam,
  ResponseType,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { MyRequest, requestHandler } from "../../express.js";
import { client } from "./openid-client.js";
import type { OutgoingHttpHeaders, ServerResponse } from "node:http";
import type { Http2ServerResponse } from "node:http2";
import { webcrypto as crypto } from 'node:crypto'

export async function openidRedirectHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler("GET", "/api/v1/redirect", async function (data) {
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration
    // USE single tenant as for all others we need permissions
    // https://portal.azure.com/

    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/login/index.json.ts
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/redirect/index.ts_old

    if (!client) {
      throw new Error("OpenID not configured!");
    }

    try {
      const result = await client.callback(
        `${process.env.BASE_URL}/redirect`,
        data
      );

      console.log(result);

      console.log(result.claims());

      //const userinfo = await client.userinfo(result, {});

      //console.log(userinfo)

      const dbUser = rawUserSchema
        .pick({
          id: true,
          username: true,
          type: true,
        })
        .optional()
        .parse(
          (
            await sql`SELECT id, username, type FROM users WHERE openid_id = ${
              result.claims().email ?? null
            } LIMIT 1`
          )[0]
        );

      if (dbUser === undefined) {
        const returnValue: [
          OutgoingHttpHeaders,
          ResponseType<"/api/v1/redirect">
        ] = [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            success: false,
            error: {
              issues: [
                {
                  code: ZodIssueCode.custom,
                  path: ["username"],
                  message: "Nutzer existiert nicht!",
                },
              ],
            },
          },
        ];
        return returnValue;
      }

      const session_id_unhashed = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
      const session_id = new Uint8Array(await crypto.subtle.digest("SHA-512", new TextEncoder().encode(session_id_unhashed)));  

          await sql.begin("READ WRITE", async (tsql) => {
            return await tsql`INSERT INTO sessions (user_id, session_id) VALUES (${dbUser.id}, ${session_id})`;
          })
       

      /** @type {import("node:http2").OutgoingHttpHeaders} */
      const responseHeaders: import("node:http2").OutgoingHttpHeaders = {
        "content-type": "text/json; charset=utf-8",
        "set-cookie": [
          `strict_id=${
            session.session_id
          }; Secure; SameSite=Strict; Path=/; HttpOnly; Max-Age=${
            48 * 60 * 60
          };`,
          `lax_id=${
            session.session_id
          }; Secure; SameSite=Lax; Path=/; HttpOnly; Max-Age=${48 * 60 * 60};`,
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
      console.error(error);
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/redirect">
      ] = [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {
          success: false,
          error: {
            issues: [
              {
                code: ZodIssueCode.custom,
                path: ["login"],
                message: String(error),
              },
            ],
          },
        },
      ];
      return returnValue;
    }
  })(request, response);
}
