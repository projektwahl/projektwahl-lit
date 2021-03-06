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
    // admin is allowed to read anything
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
      loggedInUser,
      "/api/v1/projects" as const,
      query,
      (query) => {
        const { id, title, info, deleted, ...rest } = query.filters;
        let _ = rest;
        _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".

        // warning: this shows final members to everybody but I think this is ok for us.
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
          "deleted", coalesce(t.project_leaders, array[]::varchar[]) AS project_leaders, coalesce(q.computed_in_projects, array[]::varchar[]) as computed_in_projects FROM projects_with_deleted LEFT JOIN  (
            SELECT u.project_leader_id, array_agg(u.username) AS project_leaders
            FROM   users u
            GROUP  BY u.project_leader_id
            ) t ON projects_with_deleted.id = t.project_leader_id
            LEFT JOIN  (
              SELECT u.computed_in_project_id, array_agg(u.username) AS computed_in_projects
              FROM   users u
              GROUP  BY u.computed_in_project_id
              ) q ON projects_with_deleted.id = q.computed_in_project_id WHERE (${
                id === undefined
              } OR id = ${id ?? null}) AND (${
          deleted === undefined
        } OR deleted = ${deleted ?? null}) AND title LIKE ${
          "%" + (title ?? "") + "%"
        }
             AND info  LIKE ${"%" + (info ?? "") + "%"}`;
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
        force_in_project_id: (q, o, v) =>
          sql`(id IS NOT DISTINCT FROM ${v ?? null}) ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
        project_leader_id: (q, o, v) =>
          sql`(id IS NOT DISTINCT FROM ${v ?? null}) ${sql.unsafe(
            o === "backwards"
              ? q === "ASC"
                ? "DESC"
                : "ASC"
              : q === "ASC"
              ? "ASC"
              : "DESC"
          )}`,
      },
      "id"
    );
  }
);
