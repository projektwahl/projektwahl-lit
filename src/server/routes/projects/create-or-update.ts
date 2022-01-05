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
import { updateField } from "../../entities.js";
import { request } from "../../express.js";
import { sql2 } from "../../sql/index.js";

// TODO FIXME you can accidentialy create instead of update if you forget to pass the id. maybe force id and setting it to null means creation.

export async function createOrUpdateProjectsHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  // TODO FIXME create or update multiple
  return await request(
    "POST",
    "/api/v1/projects/create-or-update",
    async function (project, loggedInUser) {
      // helper is allowed to create projects and change their own projects
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

      try {
        let [row] = await sql.begin("READ WRITE", async (sql) => {
          if (project.id) {
            const field = (name: string) => updateField(project, name);

            const finalQuery = sql2`UPDATE projects SET
            ${field("title")},
            ${field("info")},
            ${field("place")},
            ${field("costs")},
            ${field("min_age")},
            ${field("max_age")},
            ${field("min_participants")},
            ${field("max_participants")},
            ${field("random_assignments")},
            ${field("deleted")}
            FROM users WHERE projects.id = ${project.id} AND users.id = ${
              loggedInUser.id
            } AND (users.project_leader_id = ${
              project.id
            } AND users.type = 'helper' OR users.type = 'admin') RETURNING projects.id;`;

            return await sql(...finalQuery);
          } else {
            // TODO FIXME we can use our nice query building here
            // or postgres also has builtin features for insert and update
            let res =
              await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, deleted)
            (SELECT 
    ${project.title ?? null},
    ${project.info ?? null},
    ${project.place ?? null},
    ${project.costs ?? 0},
    ${project.min_age ?? null},
    ${project.max_age ?? null},
    ${project.min_participants ?? null},
    ${project.max_participants ?? null},
    ${project.random_assignments ?? false}, ${project.deleted ?? false} FROM users WHERE users.id = ${
                loggedInUser.id
              } AND (users.type = 'helper' OR users.type = 'admin'))
    RETURNING id;`;

            // TODO FIXME make this in sql directly
            if (loggedInUser.type === "helper") {
              await sql`UPDATE users SET project_leader_id = ${
                res[0].id as number
              } WHERE project_leader_id IS NULL AND id = ${loggedInUser.id}`;
            }

            return res;
          }
        });

        if (!row) {
          // insufficient permissions
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
            return [
              {
                "content-type": "text/json; charset=utf-8",
                ":status": 200,
              },
              {
                success: false as const,
                error: {
                  username: "Nutzer mit diesem Namen existiert bereits!",
                },
              },
            ];
          }
        }
        console.error(error);
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 500,
          },
          {
            success: false as const,
            error: {
              unknown: "Interner Fehler!",
            },
          },
        ];
      }
    }
  )(stream, headers);
}
