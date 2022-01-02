import { z } from "zod";
import type { rawProjectSchema } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

export async function projectsHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  return await request(
    "GET",
    "/api/v1/projects",
    async function (_, loggedInUser) {
      // helper is allowed to read the normal data
      // voter is allowed to read the normal data

      if (
        !(
          loggedInUser?.type === "admin" ||
          loggedInUser?.type === "helper" ||
          loggedInUser?.type === "voter"
        )
      ) {
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 403,
          },
          {
            success: false as const,
            error: {
              forbidden: "Insufficient permissions!",
            },
          },
        ];
      }

      const url = new URL(headers[":path"]!, "https://localhost:8443");

      const filters = z
        .object({
          f_id: z
            .string()
            .refine((s) => /^\d*$/.test(s))
            .transform((s) => (s === "" ? undefined : Number(s)))
            .optional(),
          f_title: z.string().optional(),
        })
        .parse(Object.fromEntries(url.searchParams as any));

      const columns = [
        "id",
        "title",
        "info",
        "place",
        "costs",
        "min_age",
        "max_age",
        "min_participants",
        "max_participants",
        "random_assignments",
      ] as const;

      return await fetchData<
        z.infer<typeof rawProjectSchema>,
        typeof filters,
        "/api/v1/projects"
      >(
        "/api/v1/projects" as const,
        headers,
        "projects",
        columns,
        filters,
        {},
        (query) => {
          return sql2`(${!query.f_id} OR id = ${
            query.f_id ?? null
          }) AND title LIKE ${"%" + (query.f_title ?? "") + "%"}`;
        }
      );
    }
  )(stream, headers);
}
