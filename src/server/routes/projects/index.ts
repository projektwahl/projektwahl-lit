import { z } from "zod";
import { rawProjectSchema } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

export async function projectsHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
  return await request("GET", "/api/v1/projects", async function () {
    const url = new URL(headers[":path"]!, "https://localhost:8443");

    // TODO FIXME validation

    const value = fetchData(
      "projects",
      ["id", "title", "info", "place", "costs", "min_age", "max_age", "min_participants", "max_participants", "random_assignments"],
      {
      },
      {
        filters: {
          id: url.searchParams.get("f_id") ?? "",
          title: url.searchParams.get("f_title") ?? "",
        },
        paginationCursor: null,
        paginationDirection: "forwards",
        paginationLimit: 10,
        sorting: url.searchParams.getAll("order").map((o) => o.split("-")), // TODO FIXME validate
      },
      (query) => {
        return sql2`title LIKE ${"%" + query.filters.title + "%"}`;
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
