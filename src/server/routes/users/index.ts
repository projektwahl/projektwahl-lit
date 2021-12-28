import { z } from "zod";
import { rawUserSchema, routes } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

export async function usersHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("GET", "/api/v1/users", async function () {
    const url = new URL(headers[":path"]!, "https://localhost:8443");

    const searchParams = z.object({
      f_id: z.string().refine(s => /^\d*$/.test(s)).transform(s => s === '' ? undefined : Number(s)),
      f_username: z.string().optional(),
      f_type: z.string().optional(),
    }).parse(Object.fromEntries(url.searchParams as any));

    console.log(searchParams)

    const sorting = z.array(z.tuple([z.string(), z.enum(["ASC", "DESC"])])).parse(url.searchParams.getAll("order").map((o) => o.split("-")))

    const schema = rawUserSchema(s=>s, s=>s);

    const value = fetchData<z.infer<typeof schema>>(
      "users",
      ["id", "type", "username"],
      {
        id: "nulls-first",
        type: "nulls-first",
        username: "nulls-first",
        password_hash: "nulls-first",
      },
      {
        filters: searchParams,
        paginationCursor: null,
        paginationDirection: "forwards",
        paginationLimit: 10,
        // TODO FIXME the order should be user specified
        // TODO FIXME also unordered needs to be an option in the ui
        /*
I think in the UI we will never be able to implement this without javascript and without reloading at every change

*/
        sorting,
      },
      (query) => {
        return sql2`username LIKE ${"%" + (query.username ?? '') + "%"}`;
      }
    );

    let result = routes["/api/v1/users"].response.parse(await sql(...value));

    return [
      {
        "content-type": "text/json; charset=utf-8",
        ":status": 200,
      },
      result,
    ];
  })(stream, headers);
}
