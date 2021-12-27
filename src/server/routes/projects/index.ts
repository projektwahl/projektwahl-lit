import { z } from "zod";
import { rawProjectSchema } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

export async function projectsHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("GET", "/api/v1/projects", async function () {
    const url = new URL(headers[":path"]!, "https://localhost:8443");

    const searchParams = z.object({
      f_id: z.number(),
      f_title: z.string()
    }).parse(Object.fromEntries(url.searchParams as any));

    const sorting = z.array(z.tuple([z.string(), z.enum(["ASC", "DESC"])])).parse(url.searchParams.getAll("order").map((o) => o.split("-")))

    const value = fetchData(
      "projects",
      ["id", "title", "info", "place", "costs", "min_age", "max_age", "min_participants", "max_participants", "random_assignments"],
      {
      },
      {
        filters: {
          id: searchParams.f_id,
          title: searchParams.f_title,
        },
        paginationCursor: null,
        paginationDirection: "forwards",
        paginationLimit: 10,
        sorting,
      },
      (query) => {
        return sql2`title LIKE ${"%" + query.title + "%"}`;
      }
    );

    let result = z.array(rawProjectSchema.extend({ id: z.number() })).parse(await sql(...value));

    return [
      {
        "content-type": "text/json; charset=utf-8",
        ":status": 200,
      },
      result,
    ];
  })(stream, headers);
}
