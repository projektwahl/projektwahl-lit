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
import { z } from "zod";
import type { rawProjectSchema } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { fetchData } from "../../entities.js";
import { requestHandler } from "../../express.js";
import { sql2 } from "../../sql/index.js";
import type { IncomingMessage, ServerResponse } from "node:http";

export async function projectsHandler(
  request: IncomingMessage,
  response: ServerResponse
) {
  return await requestHandler(
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
        "deleted",
      ] as const;

      return await fetchData<
        z.infer<typeof rawProjectSchema>,
        typeof filters,
        "/api/v1/projects"
      >(
        "/api/v1/projects" as const,
        headers,
        "projects_with_deleted",
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
  )(request, response);
}
