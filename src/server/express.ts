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
import { routes, ResponseType, userSchema } from "../lib/routes.js";
import { z, ZodIssueCode } from "zod";
import { retryableBegin } from "./database.js";
import cookie from "cookie";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defaultHeaders } from "./server-handler.js";
import type {
  Http2ServerRequest,
  Http2ServerResponse,
  OutgoingHttpHeaders,
} from "http2";
import nodeCrypto from "node:crypto";
import { suspend } from "../client/utils.js";
import { typedSql } from "./describe.js";
// @ts-expect-error wrong typings
const { webcrypto: crypto }: { webcrypto: Crypto } = nodeCrypto;

export type MyRequest = (IncomingMessage | Http2ServerRequest) &
  Required<Pick<IncomingMessage | Http2ServerRequest, "url" | "method">>;

export function requestHandler<P extends keyof typeof routes>(
  method: string,
  path: P,
  handler: (
    r: z.infer<typeof routes[P]["request"]>,
    user: z.infer<typeof userSchema>,
    session_id: Uint8Array | undefined
  ) =>
    | PromiseLike<[OutgoingHttpHeaders, ResponseType<P>]>
    | [OutgoingHttpHeaders, ResponseType<P>]
): (
  url: URL,
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) => Promise<boolean> {
  const fn = async (
    url: URL,
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

      if (request.method === method) {
        let user: z.infer<typeof userSchema> | undefined = undefined;
        const cookies = request.headers.cookie
          ? cookie.parse(request.headers.cookie)
          : {};
        // implementing https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02#section-8.8.2
        const session_id_unhashed: string | Uint8Array | undefined =
          request.method === "GET" ? cookies.lax_id : cookies.strict_id;

        let session_id: Uint8Array | undefined;

        if (session_id_unhashed) {
          // if the hashed session id gets leaked in the log files / database dump or so you still are not able to login with it.
          session_id = new Uint8Array(
            await crypto.subtle.digest(
              "SHA-512",
              new TextEncoder().encode(session_id_unhashed)
            )
          );
          const session_id_ = session_id;
          // @ts-expect-error todo fixme
          user = (
            await retryableBegin("READ WRITE", async (sql) => {
              //await typedSql(sql, {})`DELETE FROM sessions WHERE CURRENT_TIMESTAMP >= updated_at + interval '24 hours' AND session_id != ${session_id} `
              return await typedSql(sql, {
                types: [17],
                columns: {
                  id: 23,
                  type: null, // custom enum
                  username: 1043,
                  group: 1043,
                  age: 23,
                },
              } as const)`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP FROM users WHERE users.id = sessions.user_id AND session_id = ${session_id_} AND CURRENT_TIMESTAMP < updated_at + interval '24 hours' RETURNING users.id, users.type, users.username, users.group, users.age`;
            })
          )[0];
        }

        let body: ResponseType<P>;

        if (request.method === "POST") {
          body = routes[path].request.safeParse(await json(request));
        } else {
          body = routes[path].request.safeParse(
            JSON.parse(
              decodeURIComponent(
                url.search == "" ? "{}" : url.search.substring(1)
              )
            )
          ); // TODO FIXME if this throws
        }
        const requestBody: ResponseType<P> = body;
        if (requestBody.success) {
          await suspend();
          const [new_headers, responseBody] = await handler(
            requestBody.data,
            user,
            session_id
          );
          const { ":status": _, ...finalHeaders } = new_headers;
          // TODO FIXME it is nowhere ensured that :status is set.
          response.writeHead(Number(new_headers[":status"]), {
            ...defaultHeaders,
            ...finalHeaders,
          });
          const stringified = JSON.stringify(responseBody);
          setImmediate(() => {
            response.end(stringified);
          });
        } else {
          // https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md

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
