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
import { ZodIssueCode } from "zod";
import type { ResponseType } from "../../../lib/routes.js";
import { fetchData } from "../../entities.js";
import { MyRequest, requestHandler } from "../../express.js";
import { sql2 } from "../../sql/index.js";
import type { OutgoingHttpHeaders, ServerResponse } from "node:http";
import type { Http2ServerResponse } from "node:http2";

export async function projectsHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler(
    "GET",
    "/api/v1/projects",
    async function (query, loggedInUser) {
      // helper is allowed to read the normal data
      // voter is allowed to read the normal data

      if (
        !(
          loggedInUser?.type === "admin" ||
          loggedInUser?.type === "helper" ||
          loggedInUser?.type === "voter"
        )
      ) {
        const returnValue: [
          OutgoingHttpHeaders,
          ResponseType<"/api/v1/projects">
        ] = [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 403,
          },
          {
            success: false as const,
            error: {
              issues: [
                {
                  code: ZodIssueCode.custom,
                  path: ["forbidden"],
                  message: "Insufficient permissions!",
                },
              ],
            },
          },
        ];
      }

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

      return await fetchData<"/api/v1/projects">(
        "/api/v1/projects" as const,
        "projects_with_deleted",
        columns,
        query,
        (query) => {
          return sql2`(${!query.filters.id} OR id = ${
            query.filters.id ?? null
          }) AND title LIKE ${"%" + (query.filters.title ?? "") + "%"}`;
        }
      );
    }
  )(request, response);
}
