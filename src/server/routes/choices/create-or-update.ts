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
import type postgres from "postgres";
import { sql } from "../../database.js";
import { MyRequest, requestHandler } from "../../express.js";
import type { OutgoingHttpHeaders, ServerResponse } from "node:http";
import type { Http2ServerResponse } from "node:http2";
import { rawProjectSchema, ResponseType, routes } from "../../../lib/routes.js";
import { z, ZodIssueCode } from "zod";

export async function updateChoiceHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await createOrUpdateChoiceHandler(
    "/api/v1/choices/update",
    request,
    response,
    async (sql, choice) => {
      if (choice.rank === null) {
        return await sql`DELETE FROM choices WHERE user_id = ${choice.user_id} AND project_id = ${choice.project_id}`;
      } else {
        return await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${choice.user_id}, ${choice.project_id}, ${choice.rank}) ON CONFLICT (user_id, project_id) DO UPDATE SET rank = ${choice.rank};`;
      }
    }
  );
}

export async function createOrUpdateChoiceHandler<
  P extends "/api/v1/choices/update"
>(
  path: P,
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse,
  dbquery: (
    sql: postgres.TransactionSql<{}>,
    choice: z.infer<typeof routes[P]["request"]>
  ) => any
) {
  // TODO FIXME create or update multiple
  return await requestHandler(
    "POST",
    path,
    async function (choice, loggedInUser) {
      // helper is allowed to create projects and change their own projects
      // voter is not allowed to do anything

      if (!loggedInUser) {
        const returnValue: [
          OutgoingHttpHeaders,
          ResponseType<"/api/v1/choices/update">
        ] = [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 401,
          },
          {
            success: false as const,
            error: {
              issues: [
                {
                  code: ZodIssueCode.custom,
                  path: ["unauthorized"],
                  message: "Not logged in!",
                },
              ],
            },
          },
        ];
        return returnValue;
      }

      if (!(loggedInUser?.type === "voter")) {
        const returnValue: [OutgoingHttpHeaders, ResponseType<P>] = [
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
        return returnValue;
      }

      try {
        const row = rawProjectSchema
          .pick({
            id: true,
          })
          .parse(
            (
              await sql.begin("READ WRITE", async (sql) => {
                return await dbquery(sql, choice);
              })
            )[0]
          );

        if (!row) {
          // insufficient permissions
          const returnValue: [OutgoingHttpHeaders, ResponseType<P>] = [
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
          return returnValue;
        }
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            success: true as const,
            data: row,
          },
        ];
      } catch (error: unknown) {
        console.error(error);
        const returnValue: [OutgoingHttpHeaders, ResponseType<P>] = [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 500,
          },
          {
            success: false as const,
            error: {
              issues: [
                {
                  code: ZodIssueCode.custom,
                  path: ["unknown"],
                  message: "Interner Fehler!",
                },
              ],
            },
          },
        ];
        return returnValue;
      }
    }
  )(request, response);
}
