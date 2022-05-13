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
import { sql } from "../../database.js";
import { requestHandler } from "../../express.js";
import type { OutgoingHttpHeaders } from "node:http";
import type { ResponseType, routes, userSchema } from "../../../lib/routes.js";
import { z, ZodIssueCode } from "zod";
import { typedSql } from "../../describe.js";

export const createProjectsHandler = createOrUpdateProjectsHandler(
  "/api/v1/projects/create",
  async (
    tsql,
    project,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => {
    const {
      title,
      info,
      place,
      costs,
      min_age,
      max_age,
      min_participants,
      max_participants,
      random_assignments,
      deleted,
      ...rest
    } = project;
    let _ = rest;
    _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
    const res = await typedSql(tsql, {
      columns: { id: 23 },
    } as const)`INSERT INTO projects_with_deleted (title, info, place, costs, age_range, min_participants, max_participants, random_assignments, deleted, last_updated_by)
            (SELECT 
    ${title ?? null},
    ${info ?? null},
    ${place ?? null},
    ${costs ?? 0},
    '[${min_age ?? null},
    ${max_age ?? null}]',
    ${min_participants ?? null},
    ${max_participants ?? null},
    ${random_assignments ?? false}, ${deleted ?? false}, ${
      loggedInUser.id
    } FROM users_with_deleted WHERE users_with_deleted.id = ${
      loggedInUser.id
    } AND (users_with_deleted.type = 'helper' OR users_with_deleted.type = 'admin'))
    RETURNING id;`;

    // TODO FIXME make this in sql directly
    if (loggedInUser.type === "helper") {
      await typedSql(tsql, {
        columns: {},
      } as const)`UPDATE users_with_deleted SET project_leader_id = ${res[0].id} WHERE project_leader_id IS NULL AND id = ${loggedInUser.id}`;
    }

    return res;
  }
);

export const updateProjectsHandler = createOrUpdateProjectsHandler(
  "/api/v1/projects/update",
  async (
    tsql,
    project,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => {
    const {
      id,
      title,
      info,
      place,
      costs,
      min_age,
      max_age,
      min_participants,
      max_participants,
      random_assignments,
      deleted,
      ...rest
    } = project;
    let _ = rest;
    _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
    const finalQuery = typedSql(tsql, {
      columns: { id: 23 },
    } as const)`UPDATE projects_with_deleted SET
    "title" = CASE WHEN ${title !== undefined} THEN ${
      title ?? null
    } ELSE "projects_with_deleted"."title" END,
    "info" = CASE WHEN ${info !== undefined} THEN ${
      info ?? null
    } ELSE "projects_with_deleted"."info" END,
    "place" = CASE WHEN ${place !== undefined} THEN ${
      place ?? null
    } ELSE "projects_with_deleted"."place" END,
    "costs" = CASE WHEN ${costs !== undefined} THEN ${
      costs ?? null
    } ELSE "projects_with_deleted"."costs" END,
    "age_range" = '[CASE WHEN ${min_age !== undefined} THEN ${
      min_age ?? null
    } ELSE lower("projects_with_deleted"."age_range") END,
    CASE WHEN ${max_age !== undefined} THEN ${
      max_age ?? null
    } ELSE upper("projects_with_deleted"."age_range") END]',
    "min_participants" = CASE WHEN ${min_participants !== undefined} THEN ${
      min_participants ?? null
    } ELSE "projects_with_deleted"."min_participants" END,
    "max_participants" = CASE WHEN ${max_participants !== undefined} THEN ${
      max_participants ?? null
    } ELSE "projects_with_deleted"."max_participants" END,
    "random_assignments" = CASE WHEN ${random_assignments !== undefined} THEN ${
      random_assignments ?? null
    } ELSE "projects_with_deleted"."random_assignments" END,
    "deleted" = CASE WHEN ${deleted !== undefined} THEN ${
      deleted ?? null
    } ELSE "projects_with_deleted"."deleted" END,
last_updated_by = ${loggedInUser.id}
FROM users_with_deleted WHERE projects_with_deleted.id = ${id} AND users_with_deleted.id = ${
      loggedInUser.id
    } AND (users_with_deleted.project_leader_id = ${id} AND users_with_deleted.type = 'helper' OR users_with_deleted.type = 'admin') RETURNING projects_with_deleted.id;`;

    return await finalQuery;
  }
);

export function createOrUpdateProjectsHandler<
  P extends "/api/v1/projects/create" | "/api/v1/projects/update"
>(
  path: P,
  dbquery: (
    sql: postgres.TransactionSql<Record<string, never>>,
    project: z.infer<typeof routes[P]["request"]>,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => Promise<z.infer<typeof routes[P]["response"]>[]>
) {
  // TODO FIXME create or update multiple
  return requestHandler("POST", path, async function (project, loggedInUser) {
    // admin is allowed to change any project
    // helper is allowed to create projects and change their own projects
    // voter is not allowed to do anything

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/projects/create" | "/api/v1/projects/update">
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
                message: "Nicht angemeldet! Klicke rechts oben auf Anmelden.",
              },
            ],
          },
        },
      ];
      return returnValue;
    }

    if (!(loggedInUser?.type === "admin" || loggedInUser?.type === "helper")) {
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
                message: "Unzureichende Berechtigung!",
              },
            ],
          },
        },
      ];
      return returnValue;
    }

    try {
      const row: { id: number } = (
        await sql.begin("READ WRITE", async (tsql) => {
          await tsql`SELECT set_config('projektwahl.type', ${
            loggedInUser?.type ?? null
          }, true);`;
          const result: { id: number }[] = await dbquery(
            tsql,
            project,
            loggedInUser
          );
          return result;
        })
      )[0];

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
                  message: "Unzureichende Berechtigung!",
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
  });
}
