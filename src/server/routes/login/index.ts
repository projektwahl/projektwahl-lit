import { sensitiveHeaders } from "node:http2";
import { z } from "zod";
import { rawSessionType, rawUserHelperOrAdminSchema, rawUserSchema, rawUserVoterSchema } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { request } from "../../express.js";
import { checkPassword } from "../../password.js";

export async function loginHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("POST", "/api/v1/login", async function (body) {
    const dbUser = z.union([rawUserVoterSchema, rawUserHelperOrAdminSchema]).parse((await sql`SELECT id, username, password_hash, password_salt, type FROM users WHERE username = ${body.username} LIMIT 1`)[0]);

    if (dbUser === undefined) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": "200",
        },
        {
          success: false as const,
          error: {
            username: "Nutzer existiert nicht!",
          },
        },
      ];
    }

    if (
      dbUser.password_hash == null ||
      !(await checkPassword(
        dbUser.password_hash,
        dbUser.password_salt,
        body.password
      ))
    ) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": "200",
        },
        {
          success: false as const,
          error: {
            password: "Falsches Passwort!",
          },
        },
      ];
    }

    const session = rawSessionType.pick({ session_id: true }).parse((await sql.begin("READ WRITE", async (tsql) => {
      return await tsql`INSERT INTO sessions (user_id) VALUES (${dbUser.id}) RETURNING session_id`;
    }))[0])

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const headers: import("node:http2").OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
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
      headers,
      {
        success: true as const,
        data: null,
      },
    ];
  })(stream, headers);
}
