import { sensitiveHeaders } from "node:http2";
import type { z, ZodObject, ZodTypeAny } from "zod";
import {
  rawSessionType,
  rawUserHelperOrAdminSchema,
  rawUserSchema,
  rawUserVoterSchema,
  UnknownKeysParam,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { request } from "../../express.js";
import { checkPassword } from "../../password.js";

export async function logoutHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  return await request(
    "POST",
    "/api/v1/logout",
    async function (body, user, session_id) {
      if (session_id) {
        await sql.begin("READ WRITE", async (tsql) => {
          return await tsql`DELETE FROM sessions WHERE session_id = ${session_id}`;
        });
      }

      /** @type {import("node:http2").OutgoingHttpHeaders} */
      const headers: import("node:http2").OutgoingHttpHeaders = {
        "content-type": "text/json; charset=utf-8",
        ":status": 200,
        "set-cookie": [
          `strict_id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; HttpOnly; SameSite=Strict`,
          `lax_id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; HttpOnly; SameSite=Lax`,
          `username=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Lax`,
        ],
      };
      return [
        headers,
        {
          success: true as const,
          data: {},
        },
      ];
    }
  )(stream, headers);
}
