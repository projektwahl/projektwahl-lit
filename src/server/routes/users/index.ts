/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import {
  rawUserSchema,
  rawUserVoterSchema,
  rawUserHelperOrAdminSchema,
} from "../../../lib/routes.js";
import { fetchData } from "../../entities.js";
import { requestHandler } from "../../express.js";
import { sql2 } from "../../sql/index.js";
import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";

function includes<T, U extends T>(arr: readonly U[], elem: T): elem is U {
  return arr.includes(elem as any);
}

export async function usersHandler(
  request: IncomingMessage | Http2ServerRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler(
    "GET",
    "/api/v1/users",
    async function (_, loggedInUser, session_id) {
      // helper is allowed to read the normal data
      // voter is not allowed to do anything

      if (
        !(loggedInUser?.type === "admin" || loggedInUser?.type === "helper")
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

      const url = new URL(request.url!, "https://localhost:8443");

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
        "deleted",
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
        request,
        "users_with_deleted",
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
    }
  )(request, response);
}
