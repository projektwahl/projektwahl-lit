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
import type { MyResponseType } from "../../../lib/routes.js";
import { fetchData } from "../../entities.js";
import { requestHandler } from "../../express.js";
import { sql } from "../../database.js";

export const sessionsHandler = requestHandler(
  "GET",
  "/api/v1/sessions",
  async function (query, loggedInUser) {
    // admin is allowed to read anything
    // helper is allowed to read the normal data
    // voter is allowed to read users who are project leaders (see row level security)

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        MyResponseType<"/api/v1/sessions">,
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

    const ret: [OutgoingHttpHeaders, MyResponseType<"/api/v1/sessions">] =
      await fetchData<"/api/v1/sessions">(
        loggedInUser,
        "/api/v1/sessions" as const,
        query,
        (query) => {
          const { user_id } = query.filters;
          return sql`SELECT encode("session_id", 'base64') AS session_id,
            "created_at",
            "updated_at",
            "user_id"
             FROM sessions WHERE user_id = ${
               loggedInUser.type === "admin"
                 ? user_id ?? loggedInUser.id
                 : loggedInUser.id
             }`;
        },
        {
          session_id: (q, o) =>
            sql`session_id ${sql.unsafe(
              o === "backwards"
                ? q === "ASC"
                  ? "DESC"
                  : "ASC"
                : q === "ASC"
                ? "ASC"
                : "DESC",
            )}`,
        },
        "session_id",
      );
    return ret;
  },
);
