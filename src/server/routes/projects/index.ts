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

export const projectsHandler = requestHandler(
  "GET",
  "/api/v1/projects",
  async function (query, loggedInUser) {
    // helper is allowed to read the normal data
    // voter is allowed to read the normal data

    if (!loggedInUser) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/projects">
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

    if (
      !(
        loggedInUser?.type === "admin" ||
        loggedInUser?.type === "helper" ||
        loggedInUser?.type === "voter"
      )
    ) {
      const returnValue: [
        OutgoingHttpHeaders,
        ResponseType<"/api/v1/projects">
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

    return await fetchData<"/api/v1/projects">(
      "/api/v1/projects" as const,
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
          "deleted" FROM projects_with_deleted WHERE (${!query.filters
            .id} OR id = ${query.filters.id ?? null}) AND title LIKE ${
          "%" + (query.filters.title ?? "") + "%"
        }
             AND info  LIKE ${"%" + (query.filters.info ?? "") + "%"}`;
      },
      {
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
        title: (q, o) =>
          sql`title ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
        info: (q, o) =>
          sql`info ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
        force_in_project_id_eq: (q, o, v) =>
          sql`(users_with_deleted.force_in_project_id IS NOT DISTINCT FROM ${
            v ?? null
          }) ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
        project_leader_id_eq: (q, o, v) =>
          sql`(users_with_deleted.project_leader_id IS NOT DISTINCT FROM ${
            v ?? null
          }) ${sql.unsafe(
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
