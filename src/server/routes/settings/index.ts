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
import type { OutgoingHttpHeaders } from "node:http";
import { ZodIssueCode } from "zod";
import type { ResponseType } from "../../../lib/routes.js";
import { fetchData } from "../../entities.js";
import { requestHandler } from "../../express.js";
import { sql } from "../../database.js";

export const settingsHandler = requestHandler(
  "GET",
  "/api/v1/settings",
  async function (query, loggedInUser) {
    // admin is allowed to read anything
    // helper is allowed to read the normal data
    // voter is allowed to read users who are project leaders (see row level security)

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/sessions">
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

    const ret: [OutgoingHttpHeaders, ResponseType<"/api/v1/settings">] =
      await fetchData<"/api/v1/settings">(
        loggedInUser,
        "/api/v1/settings" as const,
        query,
        (query) => {
          const { ...rest } = query.filters;
          let _ = rest;
          _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
          return sql`SELECT (extract(epoch from open_date) * 1000)::BIGINT AS open_date, (extract(epoch from voting_start_date) * 1000)::BIGINT AS voting_start_date, (extract(epoch from voting_end_date) * 1000)::BIGINT AS voting_end_date, (extract(epoch from results_date) * 1000)::BIGINT AS results_date FROM settings`;
        },
        {},
        undefined
      );
    return ret;
  }
);
