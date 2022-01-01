// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { zod2result } from "../lib/result.js";
import { json } from "node:stream/consumers";
import { URL } from "url";
import { rawUserHelperOrAdminSchema, rawUserSchema, rawUserVoterSchema, routes, UnknownKeysParam } from "../lib/routes.js";
import type {
  IncomingHttpHeaders,
  OutgoingHttpHeaders,
  ServerHttp2Stream,
} from "node:http2";
import type { z, ZodObject, ZodTypeAny } from "zod";
import { sql } from "./database.js";
import cookie from 'cookie'

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

const userSchema = rawUserSchema(
  userMapper(rawUserVoterSchema),
  userMapper(rawUserHelperOrAdminSchema)
)

export function request<P extends keyof typeof routes>(
  method: string,
  path: P,
  handler: (
    r: z.infer<typeof routes[P]["request"]>,
    user: z.infer<typeof userSchema> | null
  ) => Promise<[OutgoingHttpHeaders, z.infer<typeof routes[P]["response"]>]>
): (
  stream: ServerHttp2Stream,
  headers: IncomingHttpHeaders
) => Promise<boolean> {
  let fn = async (
    stream: import("http2").ServerHttp2Stream,
    headers: import("http2").IncomingHttpHeaders
  ) => {
    try {
      if (headers[":method"] !== "GET" && headers[":method"] !== "POST") {
        throw new Error("Unsupported http method!")
      }
      
      if (headers[":method"] === "POST" && headers['x-csrf-protection'] !== 'projektwahl') {
        throw new Error('No CSRF header!');
      }

      let url = new URL(headers[":path"]!, "https://localhost:8443");
      if (
        headers[":method"] === method &&
        new RegExp(path).test(/** @type {string} */ url.pathname)
      ) {
        let user = null;
        if (headers.cookie) {
          var cookies = cookie.parse(headers.cookie);
  
          // implementing https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02#section-8.8.2
          const session_id = headers[":method"] === "GET" ? cookies.lax_id : cookies.strict_id;
          if (session_id) {
            user = userSchema.parse((await sql.begin('READ WRITE', async (sql) => {
              await sql`DELETE FROM sessions WHERE CURRENT_TIMESTAMP >= updated_at + interval '24 hours'`
              return await sql`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP FROM users WHERE users.id = sessions.user_id AND session_id = ${session_id} AND CURRENT_TIMESTAMP < updated_at + interval '24 hours' RETURNING users.id, users.type, users.username, users.group, users.age`;
            }))[0]);
            console.log(user)
          }
        }

        const body =
          headers[":method"] === "POST" ? await json(stream) : undefined;
        const requestBody = zod2result(routes[path].request, body);
        if (requestBody.success) {
          const [new_headers, responseBody] = await handler(requestBody.data, user);
          console.log("responseBody", responseBody);
          routes[path].response.parse(responseBody);
          stream.respond(new_headers);
          stream.end(JSON.stringify(responseBody));
        } else {
          console.log(requestBody);
          stream.respond({
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          });
          stream.end(JSON.stringify(requestBody));
        }

        return true;
      }
    } catch (error) {
      console.error(error);
      stream.respond({ ":status": 200 });
      stream.end(JSON.stringify({
        success: false,
        error: {
          error: String(error)
        }
      }));
      return true;
    }
    return false;
  };
  return fn;
}
