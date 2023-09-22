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
import type { ResponseType } from "../../../lib/routes.js";
import { ZodIssueCode } from "zod";

export const updateSettingsHandler = requestHandler(
  "POST",
  "/api/v1/settings/update",
  async function (new_settings, loggedInUser) {
    // admin is allowed to change any project
    // helper is allowed to create projects and change their own projects
    // voter is not allowed to do anything

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/settings/update">,
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

    if (!(loggedInUser.type === "admin")) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/settings/update">,
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
      await sql.begin("READ WRITE", async (tsql) => {
        await tsql`SELECT set_config('projektwahl.id', ${loggedInUser.id}::text, true);`;
        await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}::text, true);`;
        const {
          open_date,
          voting_start_date,
          voting_end_date,
          results_date,
          ...rest
        } = new_settings;
        let _ = rest;
        _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
        const finalQuery = tsql`UPDATE settings SET open_date = to_timestamp(${open_date}::BIGINT/1000)::TIMESTAMP WITH TIME ZONE, voting_start_date = to_timestamp(${voting_start_date}::BIGINT/1000)::TIMESTAMP WITH TIME ZONE, voting_end_date = to_timestamp(${voting_end_date}::BIGINT/1000)::TIMESTAMP WITH TIME ZONE, results_date = to_timestamp(${results_date}::BIGINT/1000)::TIMESTAMP WITH TIME ZONE;`;
        // warning: this will not work if we will ever use multiple workers in production
        // TODO FIXME we could use the postgresql notify feature?

        //await updateCachedSettings(tsql);
        return await finalQuery;
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
      if (error instanceof postgres.PostgresError) {
        const returnValue: [
          OutgoingHttpHeaders,
          ResponseType<"/api/v1/settings/update">,
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
      console.error(error);
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/settings/update">,
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
  },
);
