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
            computed_in_project_id,
            deleted,
            group,
            valid,
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
            ${
              id === loggedInUser.id ||
              loggedInUser.type === "admin" ||
              loggedInUser.type === "helper"
                ? sql`computed_in_project_id,`
                : sql``
            }
            "deleted" ${
              loggedInUser.type === "admin" || loggedInUser.type === "helper"
                ? sql`, t.valid`
                : sql``
            } FROM users_with_deleted ${
            loggedInUser.type === "admin" || loggedInUser.type === "helper"
              ? sql`, LATERAL
(WITH c AS (SELECT COUNT(*) AS count, bit_or(1 << rank) AS ranks FROM choices WHERE users_with_deleted.id = choices.user_id)

    SELECT CASE
        WHEN (users_with_deleted.type = 'voter' AND count = 5 AND ranks = 62) THEN 'valid'
        WHEN (users_with_deleted.type = 'voter' AND users_with_deleted.project_leader_id IS NOT NULL) THEN 'project_leader'
        WHEN (users_with_deleted.type = 'voter' AND users_with_deleted.force_in_project_id IS NOT NULL) THEN 'valid'
        WHEN (users_with_deleted.type = 'voter') THEN 'invalid'
        WHEN (users_with_deleted.type = 'helper' OR users_with_deleted.type = 'admin') THEN 'neutral'
    END
    AS valid FROM c) AS t`
              : sql``
          } WHERE TRUE ${
            id === undefined ? sql`` : sql`AND id = ${id ?? null}`
          } ${
            username === undefined
              ? sql``
              : sql`AND username LIKE ${"%" + username + "%"}`
          }
          ${
            project_leader_id === undefined
              ? sql``
              : sql`
          AND project_leader_id IS NOT DISTINCT FROM ${
            project_leader_id ?? null
          }`
          }
          ${
            deleted === undefined
              ? sql``
              : sql`AND deleted = ${deleted ?? null}`
          }
          ${valid === undefined ? sql`` : sql`AND t.valid = ${valid ?? null}`}
          ${
            force_in_project_id === undefined ||
            !(loggedInUser.type === "admin" || loggedInUser.type === "helper")
              ? sql``
              : sql`AND force_in_project_id IS NOT DISTINCT FROM ${
                  force_in_project_id ?? null
                }`
          }
          ${
            computed_in_project_id === undefined ||
            !(loggedInUser.type === "admin" || loggedInUser.type === "helper")
              ? sql``
              : sql`AND computed_in_project_id IS NOT DISTINCT FROM ${
                  computed_in_project_id ?? null
                }`
          }
          ${
            group === undefined
              ? sql``
              : sql` AND "group" LIKE ${`${group ?? ""}%`}`
          }
          ${type === undefined ? sql`` : sql`AND type = ${type ?? null}`}`;
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
          valid: (q, o) =>
            sql`t.valid ${sql.unsafe(
              o === "backwards"
                ? q === "ASC"
                  ? "DESC"
                  : "ASC"
                : q === "ASC"
                ? "ASC"
                : "DESC"
            )}`,
          group: (q, o) =>
            sql`"group" ${sql.unsafe(
              o === "backwards"
                ? q === "ASC"
                  ? "DESC"
                  : "ASC"
                : q === "ASC"
                ? "ASC"
                : "DESC"
            )}`,
          force_in_project_id: (q, o, v) =>
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
          computed_in_project_id: (q, o, v) =>
            sql`(users_with_deleted.computed_in_project_id IS NOT DISTINCT FROM ${
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
          project_leader_id: (q, o, v) =>
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
        },
        "id"
      );
    return ret;
  }
);
