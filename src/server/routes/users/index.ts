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

export const usersHandler = requestHandler(
  "GET",
  "/api/v1/users",
  async function (query, loggedInUser) {
    // admin is allowed to read anything
    // helper is allowed to read the normal data
    // voter is allowed to read users who are project leaders (see row level security)

    if (!loggedInUser) {
      const returnValue: [OutgoingHttpHeaders, ResponseType<"/api/v1/users">] =
        [
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

    const ret: [OutgoingHttpHeaders, ResponseType<"/api/v1/users">] =
      await fetchData<"/api/v1/users">(
        loggedInUser,
        "/api/v1/users" as const,
        query,
        (query) => {
          const {
            id,
            username,
            type,
            project_leader_id,
            force_in_project_id,
            deleted,
            ...rest
          } = query.filters;
          let _ = rest;
          _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
          return sql`SELECT "id",
            "type",
            "username",
            ${loggedInUser.type === "admin" ? sql`"openid_id",` : sql``}
            "group",
            "age",
            "away",
            "project_leader_id",
            ${
              loggedInUser.type === "admin" || loggedInUser.type === "helper"
                ? sql`"force_in_project_id",`
                : sql``
            }
            "deleted" FROM users_with_deleted WHERE (${
              id === undefined
            } OR id = ${id ?? null}) AND username LIKE ${
            "%" + (username ?? "") + "%"
          }
          AND (${project_leader_id === undefined} OR project_leader_id = ${
            project_leader_id ?? null
          })
          AND (${deleted === undefined} OR deleted = ${deleted ?? null})
          AND (${
            force_in_project_id === undefined ||
            !(loggedInUser.type === "admin" || loggedInUser.type === "helper")
          } OR force_in_project_id = ${force_in_project_id ?? null})
            AND (${type === undefined} OR type = ${type ?? null})`;
        },
        {
          id: (q, o) => {
            return sql`id ${sql.unsafe(
              o === "backwards"
                ? q === "ASC"
                  ? "DESC"
                  : "ASC"
                : q === "ASC"
                ? "ASC"
                : "DESC"
            )}`;
          },
          type: (q, o) =>
            sql`type ${sql.unsafe(
              o === "backwards"
                ? q === "ASC"
                  ? "DESC"
                  : "ASC"
                : q === "ASC"
                ? "ASC"
                : "DESC"
            )}`,
          username: (q, o) =>
            sql`username ${sql.unsafe(
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
    return ret;
  }
);
