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

    const filters = z.object({
      f_id: z.string().refine(s => /^\d*$/.test(s)).transform(s => s === '' ? undefined : Number(s)).optional(),
      f_username: z.string().optional(),
      f_type: z.string().refine((s: string): s is "admin" | "helper" | "voter" | "" => includes(["admin", "helper", "voter", ""] as const, s)).transform(s => s === '' ? undefined : s).optional(),
    }).parse(Object.fromEntries(url.searchParams as any));

    const columns = ["id", "type", "username"] as const;

    const schema = rawUserSchema(s=>s, s=>s);

    return await fetchData<z.infer<typeof schema>>(
      "/api/v1/users",
      headers,
      "users",
      columns,
      filters,
      {
        id: "nulls-first",
        type: "nulls-first",
        username: "nulls-first",
        password_hash: "nulls-first",
      },
      (query) => {
        return sql2`(${!query.f_id} OR id = ${query.f_id ?? null}) AND username LIKE ${query.f_username ?? '%'}`;
      }
    );
  })(stream, headers);
}
