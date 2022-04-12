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
import { sql } from "../../database.js";
import { requestHandler } from "../../express.js";
import type { OutgoingHttpHeaders } from "node:http";
import nodeCrypto from "node:crypto";
import { typedSql } from "../../describe.js";
// @ts-expect-error wrong typings
const { webcrypto: crypto }: { webcrypto: Crypto } = nodeCrypto;

export const sudoHandler = requestHandler(
  "POST",
  "/api/v1/sudo",
  async function (body, loggedInUser) {
    if (!loggedInUser) {
      const returnValue: [OutgoingHttpHeaders, ResponseType<"/api/v1/sudo">] = [
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

    if (!(loggedInUser?.type === "admin")) {
      const returnValue: [OutgoingHttpHeaders, ResponseType<"/api/v1/sudo">] = [
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

    const r = await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.type', 'root', true);`;
      return await typedSql(tsql, {
        columns: {
          id: 23,
          username: 1043,
          password_hash: 1043,
          type: null, // custom enum
        },
      } as const)`SELECT id, username, password_hash, type FROM users WHERE id = ${body.id} LIMIT 1`;
    });

    const dbUser = r[0];

    // this intentionally tells the user whether the account exists
    if (dbUser === undefined) {
      const returnValue: [OutgoingHttpHeaders, ResponseType<"/api/v1/login">] =
        [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": "200",
          },
          {
            success: false as const,
            error: {
              issues: [
                {
                  code: ZodIssueCode.custom,
                  path: ["username"],
                  message: "Nutzer existiert nicht!",
                },
              ],
            },
          },
        ];
      return returnValue;
    }

    const session_id_unhashed = Buffer.from(
      crypto.getRandomValues(new Uint8Array(32))
    ).toString("hex");
    const session_id = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(session_id_unhashed)
      )
    );

    await sql.begin("READ WRITE", async (tsql) => {
      await tsql`SELECT set_config('projektwahl.type', ${dbUser.id}, true);`;
      return await typedSql(tsql, {
        columns: {},
      } as const)`INSERT INTO sessions (user_id, session_id) VALUES (${dbUser.id}, ${session_id})`;
    });

    const headers: OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
      "set-cookie": [
        `strict_id=${session_id_unhashed}; Secure; Path=/; SameSite=Strict; HttpOnly; Max-Age=${
          48 * 60 * 60
        };`,
        `lax_id=${session_id_unhashed}; Secure; Path=/; SameSite=Lax; HttpOnly; Max-Age=${
          48 * 60 * 60
        };`,
        `username=${encodeURIComponent(
          dbUser.username
        )}; Secure; Path=/; SameSite=Lax; Max-Age=${48 * 60 * 60};`,
        `type=${dbUser.type}; Secure; Path=/; SameSite=Lax; Max-Age=${
          48 * 60 * 60
        };`,
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
