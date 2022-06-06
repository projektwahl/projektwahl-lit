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
import type { OutgoingHttpHeaders } from "node:http2";
import { sql } from "../../database.js";
import { typedSql } from "../../describe.js";
import { requestHandler } from "../../express.js";

export const logoutHandler = requestHandler(
  "POST",
  "/api/v1/logout",
  async function (body, user, session_id) {
    if (session_id) {
      await sql.begin("READ WRITE", async (tsql) => {
        await tsql`SELECT set_config('projektwahl.id', ${
          user?.id ?? null
        }, true);`;
        return await typedSql(tsql, {
          columns: {},
        } as const)`DELETE FROM sessions WHERE session_id = ${session_id}`;
      });
    }

    const headers: OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
      "set-cookie": [
        `strict_id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; HttpOnly; SameSite=Strict`,
        `lax_id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; HttpOnly; SameSite=Lax`,
        `username=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Lax`,
        `type=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Lax`,
        `id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Lax`,
      ],
    };
    return [
      headers,
      {
        success: true as const,
        data: {},
      },
    ];
  }
);
