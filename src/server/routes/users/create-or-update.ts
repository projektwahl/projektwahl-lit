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

    try {
      const row = (
        await sql.begin("READ WRITE", async (tsql) => {
          await tsql`SELECT set_config('projektwahl.type', ${
            loggedInUser?.type ?? null
          }, true);`;
          const results = [];
          for (const user of users) {
            if ("id" in user) {
              // TODO FIXME client should send their old values so we can compare and show an error if there are conflicts

              const finalQuery = tsql`UPDATE users_with_deleted SET
  ${user.username !== undefined ? sql`"username" = ${user.username},` : sql``}
  ${
    user.openid_id !== undefined ? sql`"openid_id" = ${user.openid_id},` : sql``
  }
  ${user.type !== undefined ? sql`"type" = ${user.type},` : sql``}
  ${user.group !== undefined ? sql`"group" = ${user.group},` : sql``}
  ${user.age !== undefined ? sql`age = ${user.age},` : sql``}
  ${user.away !== undefined ? sql`"away" = ${user.away},` : sql``}
  ${
    user.project_leader_id !== undefined
      ? sql`"project_leader_id" = ${user.project_leader_id},`
      : sql``
  }
  ${
    user.force_in_project_id !== undefined
      ? sql`"force_in_project_id" = ${user.force_in_project_id},`
      : sql``
  }
  ${user.deleted !== undefined ? sql`"deleted" = ${user.deleted},` : sql``}
  ${
    user.password !== undefined
      ? sql`"password_hash" = ${await hashPassword(user.password)},`
      : sql``
  }
  "last_updated_by" = ${loggedInUser.id}

  WHERE id = ${user.id} RETURNING id, project_leader_id, force_in_project_id;`;
              // TODO FIXME (found using fuzzer) if this tries to update a nonexisting user we should return an error
              results.push(await finalQuery);
            } else {
              const query = typedSql(tsql, {
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
          // @ts-expect-error bruh
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
