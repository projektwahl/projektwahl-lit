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

import { zod2result } from "../lib/result.js";
import { json } from "node:stream/consumers";
import { URL } from "url";
import {
  rawUserSchema,
  routes,
  UnknownKeysParam,
} from "../lib/routes.js";
import type { z, ZodObject, ZodTypeAny } from "zod";
import { retryableBegin, sql } from "./database.js";
import cookie from "cookie";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defaultHeaders } from "./server-handler.js";
import type { Http2ServerRequest, Http2ServerResponse, OutgoingHttpHeaders } from "http2";

const userMapper = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  s.pick({
    id: true,
    type: true,
    username: true,
    group: true,
    age: true,
  });

const userSchema = userMapper(rawUserSchema).optional();

export function requestHandler<P extends keyof typeof routes>(
  method: string,
  path: P,
  handler: (
    r: z.infer<typeof routes[P]["request"]>,
    user: z.infer<typeof userSchema>,
    session_id: string | undefined
  ) => Promise<[OutgoingHttpHeaders, z.infer<typeof routes[P]["response"]>]>
): (request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse) => Promise<boolean> {
  let fn = async (request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse) => {
    try {
      if (request.method !== "GET" && request.method !== "POST") {
        throw new Error("Unsupported http method!");
      }

      if (
        request.method === "POST" &&
        request.headers["x-csrf-protection"] !== "projektwahl"
      ) {
        throw new Error("No CSRF header!");
      }

      let url = new URL(request.url!, "https://localhost:8443");
      if (
        request.method === method &&
        new RegExp(path).test(/** @type {string} */ url.pathname)
      ) {
        let user = undefined;
        let session_id: string | undefined = undefined;
        if (request.headers.cookie) {
          var cookies = cookie.parse(request.headers.cookie);

          // implementing https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02#section-8.8.2
          session_id =
            request.method === "GET" ? cookies.lax_id : cookies.strict_id;
          if (session_id) {
            user = userSchema.parse(
              (
                await retryableBegin("READ WRITE", async (sql) => {
                  //await sql`DELETE FROM sessions WHERE CURRENT_TIMESTAMP >= updated_at + interval '24 hours' AND session_id != ${session_id} `
                  return await sql`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP FROM users WHERE users.id = sessions.user_id AND session_id = ${session_id!} AND CURRENT_TIMESTAMP < updated_at + interval '24 hours' RETURNING users.id, users.type, users.username, users.group, users.age`;
                })
              )[0]
            );
            //console.log(user)
          }
        }

        const body =
          request.method === "POST" ? await json(request) : undefined;
        const requestBody = zod2result(routes[path].request, body);
        if (requestBody.success) {
          const [new_headers, responseBody] = await handler(
            requestBody.data,
            user,
            session_id
          );
          //console.log("responseBody", responseBody);
          routes[path].response.parse(responseBody);
          const { ":status": test, ...finalHeaders } = new_headers;
          response.writeHead(Number(new_headers[":status"]!), {
            ...defaultHeaders,
            ...finalHeaders,
          });
          response.end(JSON.stringify(responseBody));
        } else {
          //console.log(requestBody);
          response.writeHead(200, {
            ...defaultHeaders,
            "content-type": "text/json; charset=utf-8",
          });
          response.end(JSON.stringify(requestBody));
        }

        return true;
      }
    } catch (error) {
      console.error(error);
      response.writeHead(200, {
        ...defaultHeaders,
      });
      response.end(
        JSON.stringify({
          success: false,
          error: {
            error: String(error),
          },
        })
      );
      return true;
    }
    return false;
  };
  return fn;
}
