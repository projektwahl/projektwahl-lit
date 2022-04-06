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

export const updateChoiceHandler = createOrUpdateChoiceHandler(
  "/api/v1/choices/update",
  async (sql, choice, loggedInUser) => {
    // TODO FIXME Only allow updating your own choices. Later we could allow the admin to update somebody else's choices.
    const { project_id, rank, ...rest } = choice;
    let _ = rest;
    _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
    if (choice.rank === null) {
      return await typedSql(sql, {
        columns: {},
      } as const)`DELETE FROM choices WHERE user_id = ${loggedInUser.id} AND project_id = ${project_id}`;
    } else {
      return await typedSql(sql, {
        columns: {},
      } as const)`INSERT INTO choices (user_id, project_id, rank) VALUES (${loggedInUser.id}, ${project_id}, ${rank}) ON CONFLICT (user_id, project_id) DO UPDATE SET rank = ${rank};`;
    }
  }
);

export function createOrUpdateChoiceHandler<P extends "/api/v1/choices/update">(
  path: P,
  dbquery: (
    sql: postgres.TransactionSql<Record<string, never>>,
    choice: z.infer<typeof routes[P]["request"]>,
    loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>
  ) => Promise<z.infer<typeof routes[P]["response"]>[]>
) {
  return requestHandler("POST", path, async function (choice, loggedInUser) {
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
                message: "Nicht angemeldet! Klicke rechts oben auf Anmelden.",
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
                message: "Unzureichende Berechtigung!",
              },
            ],
          },
        },
      ];
      return returnValue;
    }

    try {
      await sql.begin("READ WRITE", async (tsql) => {
        await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}, true);`;
        return await dbquery(tsql, choice, loggedInUser);
      });

      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": 200,
        },
        {
          success: true as const,
          data: {},
        },
      ];
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof postgres.PostgresError) {
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
