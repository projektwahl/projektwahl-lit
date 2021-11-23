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
  
      return await sql.begin('READ WRITE', async (sql) => {

      let [row] =
						await sql`INSERT INTO users (username, password_hash, type, "group", age, away) VALUES (${
							user.username ?? null
						}, ${user.password ? await hashPassword(user.password) : null}, ${user.type ?? null}, ${
							user.group ?? null
						}, ${user.age ? user.age : null /* for csv import */}, ${
							user.away ?? false
						}) RETURNING id;`;

      console.log(row)
  
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {},
      ];
    })

    })(stream, headers);
  }
  