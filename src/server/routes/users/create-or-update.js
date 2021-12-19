import { sql } from "../../database.js";
import { request } from "../../express.js";
import { hashPassword } from "../../password.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function createUsersHandler(stream, headers) {
  // TODO FIXME create or update multiple
  return await request("POST", "/api/v1/users/create", async function (user) {
    try {
      return await sql.begin("READ WRITE", async (sql) => {
        let [row] =
          await sql`INSERT INTO users (username, password_hash, type, "group", age, away) VALUES (${
            user.username ?? null
          }, ${user.password ? await hashPassword(user.password) : null}, ${
            user.type ?? null
          }, ${user.group ?? null}, ${
            user.age ? user.age : null /* for csv import */
          }, ${user.away ?? false}) RETURNING id;`;

        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            result: "success",
            success: row,
          },
        ];
      });
    } catch (/** @type {unknown} */ error) {
      if (error instanceof Error && error.name === "PostgresError") {
        const postgresError = /** @type {PostgresError} */ error;
        if (
          postgresError.code === "23505" &&
          postgresError.constraint_name === "users_username_key"
        ) {
          // unique violation
          return [
            {
              "content-type": "text/json; charset=utf-8",
              ":status": 200,
            },
            {
              result: "failure",
              failure: {
                username: "Nutzer mit diesem Namen existiert bereits!",
              },
            },
          ];
        }
      }
      console.error(error);
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 500,
        },
        {
          result: "failure",
          failure: {
            unknown: "Interner Fehler!",
          },
        },
      ];
    }
  })(stream, headers);
}
