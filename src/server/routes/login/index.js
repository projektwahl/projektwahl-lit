import { sql } from "../../database.js";
import { request } from "../../express.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function loginHandler(stream, headers) {
  console.log("A");
  return await request("POST", "/api/v1/login", async function (body) {
    console.log("b");
    console.log(body);
    /** @type {[import("../lib/types").Existing<Pick<import("../lib/types").RawUserType, "id"|"username"|"password_hash"|"password_salt">>?]} */
    const [dbUser] =
      await sql`SELECT id, username, password_hash, password_salt, type FROM users WHERE username = ${body.username} LIMIT 1`;

    if (dbUser === undefined) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {
          result: "failure",
          failure: {
            username: "Nutzer existiert nicht!",
          },
        },
      ];
    }

    console.log(dbUser);
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
          ":status": 200,
        },
        {
          result: "failure",
          failure: {
            password: "Falsches Passwort!",
          },
        },
      ];
    }

    /** @type {[Pick<import("../lib/types").RawSessionType, "session_id">]} */
    const [session] = await sql.begin("READ WRITE", async (sql) => {
      return await sql`INSERT INTO sessions (user_id) VALUES (${dbUser.id}) RETURNING session_id`;
    });

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const headers = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
      "set-cookie": [
        `strict_id=${
          session.session_id
        }; Secure; SameSite=Strict; HttpOnly; Max-Age=${48 * 60 * 60};`,
        `lax_id=${
          session.session_id
        }; Secure; SameSite=Lax; HttpOnly; Max-Age=${48 * 60 * 60};`,
      ],
      [sensitiveHeaders]: ["set-cookie"],
    };
    return [
      headers,
      {
        result: "success",
        success: undefined,
      },
    ];
  })(stream, headers);
}
