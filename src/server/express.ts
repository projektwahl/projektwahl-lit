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

import { json } from "node:stream/consumers";
import { URL } from "url";
import {
  rawUserSchema,
  routes,
  UnknownKeysParam,
  ResponseType,
} from "../lib/routes.js";
import { z, ZodIssueCode, ZodObject, ZodTypeAny } from "zod";
import { retryableBegin } from "./database.js";
import cookie from "cookie";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defaultHeaders } from "./server-handler.js";
import type {
  Http2ServerRequest,
  Http2ServerResponse,
  OutgoingHttpHeaders,
} from "http2";

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

export type MyRequest = (IncomingMessage | Http2ServerRequest) &
  Required<Pick<IncomingMessage | Http2ServerRequest, "url" | "method">>;

export function requestHandler<P extends keyof typeof routes>(
  method: string,
  path: P,
  handler: (
    r: z.infer<typeof routes[P]["request"]>,
    user: z.infer<typeof userSchema>,
    session_id: string | undefined
  ) => PromiseLike<[OutgoingHttpHeaders, ResponseType<P>]>
): (
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) => Promise<boolean> {
  const fn = async (
    request: MyRequest,
    response: ServerResponse | Http2ServerResponse
  ) => {
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

      const url = new URL(request.url, process.env.BASE_URL);
      if (
        request.method === method &&
        new RegExp(path).test(/** @type {string} */ url.pathname)
      ) {
        let user: z.infer<typeof userSchema> | undefined = undefined;
        const cookies = request.headers.cookie
          ? cookie.parse(request.headers.cookie)
          : {};
        const session_id: string | undefined =
          request.method === "GET" ? cookies.lax_id : cookies.strict_id;

        // implementing https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02#section-8.8.2
        // TODO FIXME don't do all this for static resource requests
        if (session_id) {
          user = userSchema.parse(
            (
              await retryableBegin("READ WRITE", async (sql) => {
                //await sql`DELETE FROM sessions WHERE CURRENT_TIMESTAMP >= updated_at + interval '24 hours' AND session_id != ${session_id} `
                return await sql`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP FROM users WHERE users.id = sessions.user_id AND session_id = ${session_id} AND CURRENT_TIMESTAMP < updated_at + interval '24 hours' RETURNING users.id, users.type, users.username, users.group, users.age`;
              })
            )[0]
          );
          //console.log(user)
        }

        const rawGetBody = decodeURIComponent(url.search).substring(1);
        console.log(rawGetBody)

        const body =
          request.method === "POST"
            ? await json(request)
            : JSON.parse(rawGetBody); // TODO FIXME if this throws
        const requestBody = routes[path].request.safeParse(body);
        if (requestBody.success) {
          const [new_headers, responseBody] = await handler(
            requestBody.data,
            user,
            session_id
          );
          console.log("responseBody", responseBody);
          // TODO FIXME add schema for the result shit around that
          if (responseBody.success) {
            routes[path].response.parse(responseBody.data);
          }
          const { ":status": _, ...finalHeaders } = new_headers;
          response.writeHead(Number(new_headers[":status"]), {
            ...defaultHeaders,
            ...finalHeaders,
          });
          response.end(JSON.stringify(responseBody));
        } else {
          // https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md
          console.log(requestBody.error.issues);

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
        // TODO FIXME typings
        JSON.stringify({
          success: false,
          error: {
            issues: [
              {
                code: ZodIssueCode.custom,
                path: ["internal_error"],
                message: String(error),
              },
            ],
          },
        })
      );
      return true;
    }
    return false;
  };
  return fn;
}
