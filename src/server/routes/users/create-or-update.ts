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
import type { ResponseType } from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { requestHandler } from "../../express.js";
import { hashPassword } from "../../password.js";
import type { OutgoingHttpHeaders } from "node:http";
import { ZodIssueCode } from "zod";
import { typedSql } from "../../describe.js";

// TODO FIXME somehow ensure all attributes are read here because this is an easy way to loose data
// Also ensure create and update has the same attributes
// TO IMPROVE this maybe return the full column and also read back that data at all places

export const createOrUpdateUsersHandler = requestHandler(
  "POST",
  "/api/v1/users/create-or-update",
  async function (users, loggedInUser) {
    // helper is allowed to set voters as away (TODO implement)
    // voter is not allowed to do anything

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/users/create-or-update">
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
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/users/create-or-update">
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
                message: "Unzureichende Berechtigung!",
              },
            ],
          },
        },
      ];
      return returnValue;
    }

    // for setting in_project_id to null we need to check the db if the user was in this particular project previously
    //if (loggedInUser?.type === "helper" && users.every(user => user.action === "update" && user.))

    // if in_project_id is not null we need to check that no old value is overwritten

    // maybe do the check in a transaction? or use a trigger?

    /*
     SELECT COUNT(*) FROM users_with_deleted WHERE (id = 5 and type = 'voter' AND (users_with_deleted.project_leader_id IS NULL AND 105 IS NOT NULL OR users_with_deleted.project_leader_id = 105 AND NULL IS NULL)) OR (id = 2106 AND type = 'helper' AND project_leader_id = 105);


     SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = 5 AND voter.type = 'voter' AND voter.project_leader_id IS NOT NULL AND helper.id = 2106 AND helper.type = 'helper' AND helper.project_leader_id = voter.project_leader_id;

     SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = 5 AND voter.type = 'voter' AND voter.project_leader_id IS NULL AND helper.id = 2106 AND helper.type = 'helper' AND helper.project_leader_id = 105;
    */

    try {
      const row = (
        await sql.begin("READ WRITE", async (sql) => {
          const results = [];
          for (const user of users) {
            if ("id" in user) {
             
              
              // TODO FIXME check that only that column is updated.

             /* if (user.project_leader_id === null) {
                const permissionsQuery = await typedSql(sql, {} as const)`SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = ${user.id} AND voter.type = 'voter' AND voter.project_leader_id IS NOT NULL AND helper.id = ${loggedInUser.id} AND helper.type = 'helper' AND helper.project_leader_id = voter.project_leader_id;`
              } else if (user.project_leader_id !== undefined) {
                const permissionsQuery = await typedSql(sql, {} as const)`SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = ${user.id} AND voter.type = 'voter' AND voter.project_leader_id IS NULL AND helper.id = ${loggedInUser.id} AND helper.type = 'helper' AND helper.project_leader_id = ${user.project_leader_id};`
              }*/


              const finalQuery = typedSql(sql, {
                types: [
                  16,
                  1043,
                  16,
                  1043,
                  16,
                  null, // custom enum
                  16,
                  1043,
                  16,
                  23,
                  16,
                  16,
                  16,
                  23,
                  16,
                  23,
                  16,
                  16,
                  16,
                  1043,
                  23,
                  23,
                ],
                columns: {
                  id: 23,
                  project_leader_id: 23,
                  force_in_project_id: 23,
                },
              } as const)`UPDATE users_with_deleted SET
  "username" = CASE WHEN ${user.username !== undefined} THEN ${
                user.username ?? null
              } ELSE "users_with_deleted"."username" END,
  "openid_id" = CASE WHEN ${user.openid_id !== undefined} THEN ${
                user.openid_id ?? null
              } ELSE "users_with_deleted"."openid_id" END,
  "type" = CASE WHEN ${user.type !== undefined} THEN ${
                user.type ?? null
              } ELSE "users_with_deleted"."type" END,
  "group" = CASE WHEN ${user.group !== undefined} THEN ${
                user.group ?? null
              } ELSE "users_with_deleted"."group" END,
  "age" = CASE WHEN ${user.age !== undefined} THEN ${
                user.age ?? null
              } ELSE "users_with_deleted"."age" END,
  "away" = CASE WHEN ${user.away !== undefined} THEN ${
                user.away ?? null
              } ELSE "users_with_deleted"."away" END,
  "project_leader_id" = CASE WHEN ${
    user.project_leader_id !== undefined
  } THEN ${
                user.project_leader_id ?? null
              } ELSE "users_with_deleted"."project_leader_id" END,
  "force_in_project_id" = CASE WHEN ${
    user.force_in_project_id !== undefined
  } THEN ${
                user.force_in_project_id ?? null
              } ELSE "users_with_deleted"."force_in_project_id" END,
  "deleted" = CASE WHEN ${user.deleted !== undefined} THEN ${
                user.deleted ?? null
              } ELSE "users_with_deleted"."deleted" END,
  password_hash = CASE WHEN ${!!user.password} THEN ${
                user.password ? await hashPassword(user.password) : null
              } ELSE password_hash END,
  last_updated_by = ${loggedInUser.id}
  WHERE id = ${user.id} RETURNING id, project_leader_id, force_in_project_id;`;
              // TODO FIXME (found using fuzzer) if this tries to update a nonexisting user we should return an error
              results.push(await finalQuery);
            } else {
              const query = typedSql(sql, {
                types: [
                  1043,
                  1043,
                  1043,
                  null, // custom enum
                  1043,
                  23,
                  16,
                  16,
                  23,
                ],
                columns: {
                  id: 23,
                  project_leader_id: 23,
                  force_in_project_id: 23,
                },
              } as const)`INSERT INTO users_with_deleted (username, openid_id, password_hash, type, "group", age, away, deleted, last_updated_by) VALUES (${
                user.username ?? null
              }, ${user.openid_id ?? null}, ${
                user.password ? await hashPassword(user.password) : null
              }, ${user.type ?? null}, ${
                user.type === "voter" ? user.group ?? null : null
              }, ${user.type === "voter" ? user.age ?? null : null}, ${
                user.away ?? false
              }, ${user.deleted ?? false}, ${
                loggedInUser.id
              }) RETURNING id, project_leader_id, force_in_project_id;`;

              //console.log(await query.describe())

              results.push(await query);
            }
          }
          return results;
        })
      )[0];

      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/users/create-or-update">
      ] = [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {
          success: true as const,
          data: row,
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
          const returnValue: [
            OutgoingHttpHeaders,
            ResponseType<"/api/v1/users/create-or-update">
          ] = [
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
          const returnValue: [
            OutgoingHttpHeaders,
            ResponseType<"/api/v1/users/create-or-update">
          ] = [
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
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/users/create-or-update">
      ] = [
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
);
