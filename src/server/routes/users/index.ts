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
import type { OutgoingHttpHeaders, ServerResponse } from "node:http";
import { z, ZodIssueCode } from "zod";
import { rawUserSchema, ResponseType } from "../../../lib/routes.js";
import { fetchData } from "../../entities.js";
import { MyRequest, requestHandler } from "../../express.js";
import { sql2 } from "../../sql/index.js";
import type { Http2ServerResponse } from "node:http2";

function includes<T, U extends T>(arr: readonly U[], elem: T): elem is U {
  return arr.includes(elem as U);
}

export async function usersHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler(
    "GET",
    "/api/v1/users",
    async function (query, loggedInUser) {
      // helper is allowed to read the normal data
      // voter is not allowed to do anything

      if (
        !(loggedInUser?.type === "admin" || loggedInUser?.type === "helper")
      ) {
        const returnValue: [OutgoingHttpHeaders, ResponseType<"/api/v1/users">] = [
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
        return returnValue
      }

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

      const schema = rawUserSchema;

      const ret: [OutgoingHttpHeaders, ResponseType<"/api/v1/users">] =
        await fetchData<"/api/v1/users">(
          "/api/v1/users" as const,
          "users_with_deleted",
          columns,
          query,
          /*{
          id: "nulls-first",
          type: "nulls-first",
          username: "nulls-first",
          password_hash: "nulls-first",
        },*/
          (query) => {
            return sql2`(${!query.filters.id} OR id = ${
              query.filters.id ?? null
            }) AND username LIKE ${"%" + (query.filters.username ?? "") + "%"}
           AND (${!query.filters.project_leader_id} OR project_leader_id = ${
              query.filters.project_leader_id ?? null
            })
           AND (${!query.filters
             .force_in_project_id} OR force_in_project_id = ${
              query.filters.force_in_project_id ?? null
            })`;
          }
        );
      return ret;
    }
  )(request, response);
}
