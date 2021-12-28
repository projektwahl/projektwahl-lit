import { z } from "zod";
import { rawUserSchema, routes } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

function includes<T, U extends T>(arr: readonly U[], elem: T): elem is U {
  return arr.includes(elem as any);
}

export async function usersHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("GET", "/api/v1/users", async function () {
    const url = new URL(headers[":path"]!, "https://localhost:8443");

    console.log(Object.fromEntries(url.searchParams as any))

    const searchParams = z.object({
      f_id: z.string().refine(s => /^\d*$/.test(s)).transform(s => s === '' ? undefined : Number(s)).optional(),
      f_username: z.string().optional(),
      f_type: z.string().refine((s: string): s is "admin" | "helper" | "voter" | "" => includes(["admin", "helper", "voter", ""] as const, s)).transform(s => s === '' ? undefined : s).optional(),
    }).parse(Object.fromEntries(url.searchParams as any));

    // TODO FIXME put this in entities.ts
    const pagination = z.object({
      p_cursor: z.string().refine(s => {
        try {
          JSON.parse(s);
        } catch (e) {
          return false;
        }
        return true;
      }).transform(s => JSON.parse(s)).optional(),
      p_direction: z.enum(["forwards", "backwards"]).default("forwards"),
      p_limit: z.number().default(50),
    }).parse(Object.fromEntries(url.searchParams as any))

    console.log(searchParams)

    const columns = ["id", "type", "username"] as const;

    const sorting = z.array(z.tuple([z.enum(columns), z.enum(["ASC", "DESC"])])).parse(url.searchParams.getAll("order").map((o) => o.split("-")))

    const schema = rawUserSchema(s=>s, s=>s);

    const value = fetchData<z.infer<typeof schema>>(
      "users",
      columns,
      {
        id: "nulls-first",
        type: "nulls-first",
        username: "nulls-first",
        password_hash: "nulls-first",
      },
      {
        filters: searchParams,
        paginationCursor: pagination.p_cursor,
        paginationDirection: pagination.p_direction,
        paginationLimit: pagination.p_limit,
        // TODO FIXME the order should be user specified
        // TODO FIXME also unordered needs to be an option in the ui
        /*
I think in the UI we will never be able to implement this without javascript and without reloading at every change

*/
        sorting,
      },
      (query) => {
        return sql2`username LIKE ${"%" + (query.f_username ?? '') + "%"}`;
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
