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
import postgres from "postgres";
import { routes, ResponseType, userSchema } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { MyRequest, requestHandler } from "../../express.js";
import { hashPassword } from "../../password.js";
import { sql2 } from "../../sql/index.js";
import { updateField } from "../../entities.js";
import type { OutgoingHttpHeaders, ServerResponse } from "node:http";
import type { Http2ServerResponse } from "node:http2";
import { z, ZodIssueCode } from "zod";

// TODO FIXME somehow ensure all attributes are read here because this is an easy way to loose data
// Also ensure create and update has the same attributes
// TO IMPROVE this maybe return the full column and also read back that data at all places

export async function createUsersHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await createOrUpdateUsersHandler(
    "/api/v1/users/create",
    request,
    response,
    async (
      sql,
      user,
      loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
    ) => {
      return await sql`INSERT INTO users_with_deleted (username, openid_id, password_hash, type, "group", age, away, deleted, last_updated_by) VALUES (${
        user.username ?? null
      }, ${user.openid_id ?? null}, ${user.password ? await hashPassword(user.password) : null}, ${
        user.type ?? null
      }, ${user.type === "voter" ? user.group ?? null : null}, ${
        user.type === "voter" ? user.age ?? null : null
      }, ${user.away ?? false}, ${user.deleted ?? false}, ${
        loggedInUser.id
      }) RETURNING id, project_leader_id, force_in_project_id;`;
    }
  );
}

export async function updateUsersHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await createOrUpdateUsersHandler(
    "/api/v1/users/update",
    request,
    response,
    async (
      sql,
      user,
      loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
    ) => {
      const field = (name: keyof typeof user) =>
        updateField("users_with_deleted", user, name);

      const finalQuery = sql2`UPDATE users_with_deleted SET
  ${field("username")},
  ${field("openid_id")},
  password_hash = CASE WHEN ${!!user.password} THEN ${
        user.password ? await hashPassword(user.password) : null
      } ELSE password_hash END,
  ${field("type")},
  ${field("group")},
  ${field("age")},
  ${field("away")},
  ${field("project_leader_id")},
  ${field("force_in_project_id")},
  ${field("deleted")},
  last_updated_by = ${loggedInUser.id}
  WHERE id = ${user.id} RETURNING id, project_leader_id, force_in_project_id;`;
      // TODO FIXME (found using fuzzer) if this tries to update a nonexisting user we should return an error
      return await sql(...finalQuery);
    }
  );
}

export async function createOrUpdateUsersHandler<
  P extends "/api/v1/users/create" | "/api/v1/users/update"
>(
  path: P,
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse,
  dbquery: (
    sql: postgres.TransactionSql<{}>,
    user: z.infer<typeof routes[P]["request"]>,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => any
) {
  // TODO FIXME create or update multiple
  return await requestHandler(
    "POST",
    path,
    async function (user, loggedInUser) {
      // helper is allowed to set voters as away (TODO implement)
      // voter is not allowed to do anything

      if (!loggedInUser) {
        const returnValue: [
          OutgoingHttpHeaders,
          ResponseType<"/api/v1/users/create" | "/api/v1/users/update">
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

      if (!(loggedInUser?.type === "admin")) {
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
        const row = (
          await sql.begin("READ WRITE", async (sql) => {
            return await dbquery(sql, user, loggedInUser);
          })
        )[0];

        console.log(row);

        const returnValue: [OutgoingHttpHeaders, ResponseType<P>] = [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            success: true as const,
            data: routes[path]["response"].parse(row),
          },
        ];
        return returnValue;
      } catch (error: unknown) {
        if (error instanceof postgres.PostgresError) {
          if (
            error.code === "23505" &&
            error.constraint_name === "users_with_deleted_username_key"
          ) {
            // unique violation
            const returnValue: [OutgoingHttpHeaders, ResponseType<P>] = [
              {
                "content-type": "text/json; charset=utf-8",
                ":status": 200,
              },
              {
                success: false as const,
                error: {
                  issues: [
                    {
                      code: ZodIssueCode.custom,
                      path: ["username"],
                      message: "Nutzer mit diesem Namen existiert bereits!",
                    },
                  ],
                },
              },
            ];
            return returnValue;
          } else {
            // TODO FIXME do this everywhere else / unify
            const returnValue: [OutgoingHttpHeaders, ResponseType<P>] = [
              {
                "content-type": "text/json; charset=utf-8",
                ":status": 200,
              },
              {
                success: false as const,
                error: {
                  issues: [
                    {
                      code: ZodIssueCode.custom,
                      path: [error.column_name ?? "database"],
                      message: `${error.message}`,
                    },
                  ],
                },
              },
            ];
            return returnValue;
          }
        }
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
