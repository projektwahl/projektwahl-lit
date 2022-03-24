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
import { ZodIssueCode } from "zod";
import type { ResponseType } from "../../../lib/routes.js";
import { fetchData } from "../../entities.js";
import { requestHandler } from "../../express.js";
import type { OutgoingHttpHeaders } from "node:http";
import { sql } from "../../database.js";

export const choicesHandler = requestHandler(
  "GET",
  "/api/v1/choices",
  async function (query, loggedInUser) {
    // helper is allowed to read the normal data
    // voter is allowed to read the normal data

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/choices">
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
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/choices">
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

    return await fetchData<"/api/v1/choices">(
      "/api/v1/choices" as const,
      query,
      (query) => {
        return sql`SELECT "id",
          "title",
          "info",
          "place",
          "costs",
          "min_age",
          "max_age",
          "min_participants",
          "max_participants",
          "random_assignments",
          "deleted",
          "choices"."rank",
          "choices"."project_id",
          "choices"."user_id"
          FROM projects LEFT OUTER JOIN choices ON (projects.id = choices.project_id AND choices.user_id = ${
            loggedInUser.id
          }) WHERE (${!query.filters.id} OR id = ${
          query.filters.id ?? null
        }) AND title LIKE ${"%" + (query.filters.title ?? "") + "%"}
             AND info LIKE ${"%" + (query.filters.info ?? "") + "%"}`;
      },
      {
        // TODO FIXME nulls first/last
        rank: (q, o) =>
          sql`rank ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
        title: (q, o) =>
          sql`id ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
        id: (q, o) =>
          sql`id ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
      }
    );
  }
);
