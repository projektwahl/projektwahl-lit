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
import {
  rawProjectSchema,
  ResponseType,
  routes,
  userSchema,
} from "../../../lib/routes.js";
import { z, ZodIssueCode } from "zod";
import { typedSql } from "../../describe.js";

export const createProjectsHandler = createOrUpdateProjectsHandler(
  "/api/v1/projects/create",
  async (
    sql,
    project,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => {
    const res = z.array(rawProjectSchema.pick({ id: true })).parse(
      await typedSql(sql, {
        types: [1043, 1043, 1043, 701, 23, 23, 23, 23, 16, 16, 23, 23],
        columns: { id: 23 },
      } as const)`INSERT INTO projects_with_deleted (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, deleted, last_updated_by)
            (SELECT 
    ${project.title ?? null},
    ${project.info ?? null},
    ${project.place ?? null},
    ${project.costs ?? 0},
    ${project.min_age ?? null},
    ${project.max_age ?? null},
    ${project.min_participants ?? null},
    ${project.max_participants ?? null},
    ${project.random_assignments ?? false}, ${project.deleted ?? false}, ${
        loggedInUser.id
      } FROM users_with_deleted WHERE users_with_deleted.id = ${
        loggedInUser.id
      } AND (users_with_deleted.type = 'helper' OR users_with_deleted.type = 'admin'))
    RETURNING id;`
    );

    // TODO FIXME make this in sql directly
    if (loggedInUser.type === "helper") {
      await typedSql(sql, {
        types: [23, 23],
        columns: {},
      } as const)`UPDATE users_with_deleted SET project_leader_id = ${res[0].id} WHERE project_leader_id IS NULL AND id = ${loggedInUser.id}`;
    }

    return res;
  }
);

export const updateProjectsHandler = createOrUpdateProjectsHandler(
  "/api/v1/projects/update",
  async (
    sql,
    project,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => {
    const finalQuery = typedSql(sql, {
      types: [
        16, 1043, 16, 1043, 16, 1043, 16, 701, 16, 23, 16, 23, 16, 23, 16, 23,
        16, 16, 16, 16, 23, 23, 23, 23,
      ],
      columns: { id: 23 },
    } as const)`UPDATE projects_with_deleted SET
    "title" = CASE WHEN ${project.title !== undefined} THEN ${
      project.title ?? null
    } ELSE "projects_with_deleted"."title" END,
    "info" = CASE WHEN ${project.info !== undefined} THEN ${
      project.info ?? null
    } ELSE "projects_with_deleted"."info" END,
    "place" = CASE WHEN ${project.place !== undefined} THEN ${
      project.place ?? null
    } ELSE "projects_with_deleted"."place" END,
    "costs" = CASE WHEN ${project.costs !== undefined} THEN ${
      project.costs ?? null
    } ELSE "projects_with_deleted"."costs" END,
    "min_age" = CASE WHEN ${project.min_age !== undefined} THEN ${
      project.min_age ?? null
    } ELSE "projects_with_deleted"."min_age" END,
    "max_age" = CASE WHEN ${project.max_age !== undefined} THEN ${
      project.max_age ?? null
    } ELSE "projects_with_deleted"."max_age" END,
    "min_participants" = CASE WHEN ${
      project.min_participants !== undefined
    } THEN ${
      project.min_participants ?? null
    } ELSE "projects_with_deleted"."min_participants" END,
    "max_participants" = CASE WHEN ${
      project.max_participants !== undefined
    } THEN ${
      project.max_participants ?? null
    } ELSE "projects_with_deleted"."max_participants" END,
    "random_assignments" = CASE WHEN ${
      project.random_assignments !== undefined
    } THEN ${
      project.random_assignments ?? null
    } ELSE "projects_with_deleted"."random_assignments" END,
    "deleted" = CASE WHEN ${project.deleted !== undefined} THEN ${
      project.deleted ?? null
    } ELSE "projects_with_deleted"."deleted" END,
last_updated_by = ${loggedInUser.id}
FROM users_with_deleted WHERE projects_with_deleted.id = ${
      project.id
    } AND users_with_deleted.id = ${
      loggedInUser.id
    } AND (users_with_deleted.project_leader_id = ${
      project.id
    } AND users_with_deleted.type = 'helper' OR users_with_deleted.type = 'admin') RETURNING projects_with_deleted.id;`;

    return z.array(rawProjectSchema.pick({ id: true })).parse(await finalQuery);
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
      const row = rawProjectSchema
        .pick({
          id: true,
        })
        .parse(
          (
            await sql.begin("READ WRITE", async (sql) => {
              return await dbquery(sql, project, loggedInUser);
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
