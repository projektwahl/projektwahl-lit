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
import { ZodIssueCode, ZodObject, ZodTypeAny } from "zod";
import {
  rawUserSchema,
  UnknownKeysParam,
  ResponseType,
} from "../../../lib/routes.js";
import { sql } from "../../database.js";
import { requestHandler } from "../../express.js";
import { checkPassword } from "../../password.js";
import type { OutgoingHttpHeaders } from "node:http";
import nodeCrypto from "node:crypto";
import { typedSql } from "../../describe.js";
// @ts-expect-error wrong typings
const { webcrypto: crypto }: { webcrypto: Crypto } = nodeCrypto;

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

export const loginHandler = requestHandler(
  "POST",
  "/api/v1/login",
  async function (body) {
    const r = await typedSql(
      sql,
      {
        types: [ 25 ],
        columns: { id: 23, username: 1043, password_hash: 1043, type: 17425 }
      } as const
    )`SELECT id, username, password_hash, type FROM users WHERE username = ${body.username} LIMIT 1`;

    const dbUser = users(rawUserSchema).optional().parse(r[0]);

    // TODO FIXME this is vulnerable to side channel attacks
    // but maybe it's fine because we want to tell the user whether the account exists
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

    if (dbUser.password_hash == null) {
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
                  path: ["password"],
                  message: "Kein Password für Account gesetzt!",
                },
              ],
            },
          },
        ];
      return returnValue;
    }

    const [valid, needsRehash, newHash] = await checkPassword(
      dbUser.password_hash,
      body.password
    );

    if (!valid) {
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
                  path: ["password"],
                  message: "Falsches Passwort!",
                },
              ],
            },
          },
        ];
      return returnValue;
    }

    if (needsRehash) {
      await sql.begin("READ WRITE", async (tsql) => {
        return await typedSql(
          tsql,
          { types: [ 1043, 23 ], columns: {} } as const
        )`UPDATE users SET password_hash = ${newHash} WHERE id = ${dbUser.id}`;
      });
    }

    const session_id_unhashed = Buffer.from(
      crypto.getRandomValues(new Uint8Array(32))
    ).toString("hex");
    const session_id = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-512",
        new TextEncoder().encode(session_id_unhashed)
      )
    );

    await sql.begin("READ WRITE", async (tsql) => {
      return await typedSql(
        tsql,
        { types: [ 23, 17 ], columns: {} } as const
      )`INSERT INTO sessions (user_id, session_id) VALUES (${dbUser.id}, ${session_id})`;
    });

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const headers: import("node:http2").OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
      "set-cookie": [
        `strict_id=${session_id_unhashed}; Secure; Path=/; SameSite=Strict; HttpOnly; Max-Age=${
          48 * 60 * 60
        };`,
        `lax_id=${session_id_unhashed}; Secure; Path=/; SameSite=Lax; HttpOnly; Max-Age=${
          48 * 60 * 60
        };`,
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
  }
);
