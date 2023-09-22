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
import { routes, ResponseType, userSchema, rawUserSchema } from "../lib/routes.js";
import { z } from "zod";
import { retryableBegin } from "./database.js";
import cookie from "cookie";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defaultHeaders } from "./server-handler.js";
import type {
  Http2ServerRequest,
  Http2ServerResponse,
  OutgoingHttpHeaders,
} from "http2";
import { suspend } from "../client/utils.js";
import nodeCrypto from "node:crypto";

export type MyRequest = (IncomingMessage | Http2ServerRequest) &
  Required<Pick<IncomingMessage | Http2ServerRequest, "url" | "method">>;

export function requestHandler<P extends keyof typeof routes>(
  method: string,
  path: P,
  handler: (
    r: z.infer<typeof routes[P]["request"]>,
    user: z.infer<typeof userSchema>,
    session_id: Uint8Array | undefined,
  ) =>
    | PromiseLike<[OutgoingHttpHeaders, ResponseType<P>]>
    | [OutgoingHttpHeaders, ResponseType<P>],
): (
  url: URL,
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse,
) => Promise<void> {
  const fn = async (
    url: URL,
    request: MyRequest,
    response: ServerResponse | Http2ServerResponse,
  ) => {
    if (request.method !== method) {
      response.writeHead(400, {
        ...defaultHeaders,
      });
      response.end();
      return;
    }

    if (
      request.method === "POST" &&
      request.headers["x-csrf-protection"] !== "projektwahl"
    ) {
      response.writeHead(403, {
        ...defaultHeaders,
      });
      response.end("No CSRF header!");
      return;
    }

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
          "SHA-256",
          new TextEncoder().encode(session_id_unhashed),
        ),
      );
      const session_id_ = session_id;

      user = (
        await retryableBegin(
          "ISOLATION LEVEL READ COMMITTED READ WRITE",
          async (tsql) => {
            await tsql`SELECT set_config('projektwahl.id', 0::text, true);`;
            await tsql`SELECT set_config('projektwahl.type', 'root', true);`;
            return z.array(rawUserSchema.pick({
              id: true,
              type: true,
              username: true,
              group: true,
              age: true
            })).parse(await tsql`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP FROM users WHERE users.id = sessions.user_id AND session_id = ${session_id_} AND CURRENT_TIMESTAMP < updated_at + interval '24 hours' RETURNING users.id, users.type, users.username, users.group, users.age`);
            //await typedSql(sql, {})`DELETE FROM sessions WHERE CURRENT_TIMESTAMP >= updated_at + interval '24 hours'`
          },
        )
      )[0];
    }

    let body: ResponseType<P>;

    if (request.method === "POST") {
      body = routes[path].request.safeParse(await json(request));
    } else {
      body = routes[path].request.safeParse(
        JSON.parse(
          decodeURIComponent(url.search == "" ? "{}" : url.search.substring(1)),
        ),
      ); // TODO FIXME if this throws
    }
    const requestBody: ResponseType<P> = body;
    if (requestBody.success) {
      await suspend();
      const [new_headers, responseBody] = await handler(
        requestBody.data,
        user,
        session_id,
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
      response.writeHead(200, {
        ...defaultHeaders,
        "content-type": "text/json; charset=utf-8",
      });
      response.end(JSON.stringify(requestBody));
    }
  };
  return fn;
}
