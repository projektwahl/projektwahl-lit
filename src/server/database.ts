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
import postgres, { TransactionSql } from "postgres";

if (!process.env["DATABASE_URL"]) {
  console.error("DATABASE_URL not set!");
  process.exit(1);
}

export const sql = postgres(process.env["DATABASE_URL"], {
  host: process.env["DATABASE_HOST"],
  debug: (conn, query, params) => {
    console.log(query, params);
  },
});

type UnwrapPromiseArray<T> = T extends any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ? {
      [k in keyof T]: T[k] extends Promise<infer R> ? R : T[k];
    }
  : T;

export async function retryableBegin<T>(
  options: string,
  cb: (tsql: TransactionSql<Record<string, never>>) => T | Promise<T>
): Promise<UnwrapPromiseArray<T>> {
  for (;;) {
    try {
      return await sql.begin(options, cb);
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "40001") {
        console.log("SERIALIZATION FAILURE - RETRYING");
      } else {
        throw error;
      }
    }
  }
}
