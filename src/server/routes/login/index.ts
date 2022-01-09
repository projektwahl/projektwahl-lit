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
import type { Http2ServerResponse } from "node:http2";
import type { ZodObject, ZodTypeAny } from "zod";
import {
  rawSessionType,
  rawUserSchema,
  UnknownKeysParam,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { MyRequest, requestHandler } from "../../express.js";
import { checkPassword } from "../../password.js";
import type { ServerResponse } from "node:http";

const users = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  s.pick({
    id: true,
    type: true,
    username: true,
    password_hash: true,
  });

export async function loginHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler("POST", "/api/v1/login", async function (body) {
    const r =
      await sql`SELECT id, username, password_hash, type FROM users WHERE username = ${body.username} LIMIT 1`;

    const dbUser = users(rawUserSchema).optional().parse(r[0]);

    // TODO FIXME this is vulnerable to side channel attacks
    // but maybe it's fine because we want to tell the user whether the account exists
    if (dbUser === undefined) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": "200",
        },
        {
          success: false as const,
          error: {
            username: "Nutzer existiert nicht!",
          },
        },
      ];
    }

    if (dbUser.password_hash == null) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": "200",
        },
        {
          success: false as const,
          error: {
            password: "Kein Password für Account gesetzt!",
          },
        },
      ];
    }

    const [valid, needsRehash, newHash] = await checkPassword(
      dbUser.password_hash,
      body.password
    );

    if (!valid) {
      return [
        {
          "content-type": "text/json; charset=utf-8",
          ":status": "200",
        },
        {
          success: false as const,
          error: {
            password: "Falsches Passwort!",
          },
        },
      ];
    }

    if (needsRehash) {
      await sql.begin("READ WRITE", async (tsql) => {
        return await tsql`UPDATE users SET password_hash = ${newHash} WHERE id = ${dbUser.id}`;
      });
    }

    const session = rawSessionType.pick({ session_id: true }).parse(
      (
        await sql.begin("READ WRITE", async (tsql) => {
          return await tsql`INSERT INTO sessions (user_id) VALUES (${dbUser.id}) RETURNING session_id`;
        })
      ).columns[0]
    );

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const headers: import("node:http2").OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
      "set-cookie": [
        `strict_id=${
          session.session_id
        }; Secure; Path=/; SameSite=Strict; HttpOnly; Max-Age=${48 * 60 * 60};`,
        `lax_id=${
          session.session_id
        }; Secure; Path=/; SameSite=Lax; HttpOnly; Max-Age=${48 * 60 * 60};`,
        `username=${dbUser.username}; Secure; Path=/; SameSite=Lax; Max-Age=${
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
  })(request, response);
}
