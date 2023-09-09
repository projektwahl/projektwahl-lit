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
import { deepStrictEqual } from "assert";
import type {
  MaybeRow,
  PendingQuery,
  SerializableParameter,
  TransactionSql,
} from "postgres";

// stack traces are garbage
export function typedSql<R extends Record<string, unknown>>(
  sql: TransactionSql<Record<string, unknown>>,
  description: { columns: R },
) {
  return async function test(
    template: TemplateStringsArray,
    ...args: (SerializableParameter | PendingQuery<readonly MaybeRow[]>)[]
  ) {
    const err = new Error();
    try {
      const { types: computed_query_types, columns: computed_column_types_1 } =
        await sql(template, ...args).describe();

      const computed_column_types: Record<string, number | null> =
        Object.fromEntries(
          computed_column_types_1.map((v) => [v.name, v.type]),
        );

      const computed_description: {
        types: (number | null)[];
        columns: Record<string, number | null>;
      } = {
        types: computed_query_types,
        columns: computed_column_types,
      };

      for (const [key, value] of Object.entries(description.columns)) {
        if (value === null) {
          computed_description.columns[key] = null;
        }
      }

      deepStrictEqual(computed_description.columns, description.columns);

      // TODO FIXME check types again
      return await sql<DescriptionTypes<R>[]>(template, ...args).execute();
    } catch (error) {
      console.error(err);
      throw error;
    }
  };
}

export declare const voterHelperAdminType: unique symbol;

// https://github.com/porsager/postgres/blob/master/src/types.js
// TODO FIXME
export type DescriptionTypes<T> = {
  -readonly [K in keyof T]: T[K] extends 23 | 701
    ? number
    : T[K] extends 1043
    ? string
    : T[K] extends 16
    ? boolean
    : T[K] extends 17
    ? Uint8Array
    : T[K] extends typeof voterHelperAdminType
    ? "voter" | "helper" | "admin"
    : T[K] extends null
    ? string
    : unknown;
};
