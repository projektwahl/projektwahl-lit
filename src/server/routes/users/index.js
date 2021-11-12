import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

const value = fetchData(
    "users",
    ["id", "type", "username", "password_hash"],
    {
      id: "nulls-first",
      type: "nulls-first",
      username: "nulls-first",
      password_hash: "nulls-first",
    },
    {
      filters: {},
      paginationCursor: { username: "aaaa", type: "voter" },
      paginationDirection: "forwards",
      paginationLimit: 10,
      sorting: [
        ["type", "DESC"],
        ["username", "ASC"],
        ["id", "DESC"],
      ],
    },
    {
      name: "test",
    },
    (query) => {
      return sql2``;
    }
  );

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function usersHandler(stream, headers) {
  (await request("GET", "/api/v1/update", async function (req) {

    console.log(await sql(...value));

    return [
      {
        "content-type": "text/json; charset=utf-8",
        ":status": 200,
      },
      {
          "test": 1
      }
    ];
  })(stream, headers));
}