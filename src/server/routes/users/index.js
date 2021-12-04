import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function usersHandler(stream, headers) {
  return await request("GET", "/api/v1/users", async function (req) {
    const url = new URL(headers[":path"], "https://localhost:8443");

    // TODO FIXME validation

    const value = fetchData(
      "users",
      ["id", "type", "username"],
      {
        id: "nulls-first",
        type: "nulls-first",
        username: "nulls-first",
        password_hash: "nulls-first",
      },
      {
        filters: {
          id: url.searchParams.get("f_id") ?? '',
          username: url.searchParams.get("f_username") ?? '',
          type: url.searchParams.get("f_type") ?? '',
        },
        paginationCursor: null,
        paginationDirection: "forwards",
        paginationLimit: 10,
        // TODO FIXME the order should be user specified
        // TODO FIXME also unordered needs to be an option in the ui
        /*
I think in the UI we will never be able to implement this without javascript and without reloading at every change

*/
        sorting: url.searchParams.getAll("order").map(o => o.split("-")) // TODO FIXME validate
      },
      (query) => {
        return sql2`username LIKE ${'%' + query.filters.username + '%'}`;
      }
    );

    let result = await sql(...value);

    return [
      {
        "content-type": "text/json; charset=utf-8",
        ":status": 200,
      },
      result,
    ];
  })(stream, headers);
}
