import { z } from "zod";
import {
  rawUserSchema,
  rawUserVoterSchema,
  rawUserHelperOrAdminSchema,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

function includes<T, U extends T>(arr: readonly U[], elem: T): elem is U {
  return arr.includes(elem as any);
}

export async function usersHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  return await request("GET", "/api/v1/users", async function (_, loggedInUser, session_id) {
      // helper is allowed to read the normal data
      // voter is not allowed to do anything

      console.log(loggedInUser)
      console.log(session_id)

    if (!(loggedInUser?.type === "admin" || loggedInUser?.type === "helper")) {
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
        f_username: z.string().optional(),
        f_type: z
          .string()
          .refine((s: string): s is "admin" | "helper" | "voter" | "" =>
            includes(["admin", "helper", "voter", ""] as const, s)
          )
          .transform((s) => (s === "" ? undefined : s))
          .optional(),
        f_project_leader_id: z
          .string()
          .refine((s) => /^\d*$/.test(s))
          .transform((s) => (s === "" ? undefined : Number(s)))
          .optional(),
        f_force_in_project_id: z
          .string()
          .refine((s) => /^\d*$/.test(s))
          .transform((s) => (s === "" ? undefined : Number(s)))
          .optional(),
      })
      .parse(Object.fromEntries(url.searchParams as any));

    const columns = [
      "id",
      "type",
      "username",
      "group",
      "age",
      "away",
      "project_leader_id",
      "force_in_project_id",
    ] as const;

    const schema = rawUserSchema(
      rawUserVoterSchema,
      rawUserHelperOrAdminSchema
    );

    return await fetchData<
      z.infer<typeof schema>,
      typeof filters,
      "/api/v1/users"
    >(
      "/api/v1/users" as const,
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
        return sql2`(${!query.f_id} OR id = ${
          query.f_id ?? null
        }) AND username LIKE ${"%" + (query.f_username ?? "") + "%"}
           AND (${!query.f_project_leader_id} OR project_leader_id = ${
          query.f_project_leader_id ?? null
        })
           AND (${!query.f_force_in_project_id} OR force_in_project_id = ${
          query.f_force_in_project_id ?? null
        })`;
      }
    );
  })(stream, headers);
}
