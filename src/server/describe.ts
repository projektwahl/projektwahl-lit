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
import type { Sql } from "postgres";

type NullableObject<Type> = {
  [Property in keyof Type]: Type[Property] | null;
};

// stack traces are garbage
export function typedSql<
  Q extends readonly (number | null)[],
  R extends { [column: string]: number | null }
>(sql: Sql<Record<string, never>>, description: { types: Q; columns: R }) {
  return async function test(
    template: TemplateStringsArray,
    ...args: NullableObject<DescriptionTypes<Q>>
  ) {
    const err = new Error()
    try {
    const { types: computed_query_types, columns: computed_column_types_1 } =
      // @ts-expect-error unknown
      await sql(template, ...args).describe();

    const computed_column_types: {
      [k: string]: number | null;
    } = Object.fromEntries(
      computed_column_types_1.map((v) => [v.name, v.type])
    );

    const computed_description: {
      types: (number | null)[];
      columns: {
        [k: string]: number | null;
      };
    } = {
      types: computed_query_types,
      columns: computed_column_types,
    };

    for (let i = 0; i < description.types.length; i++) {
      if (description.types[i] === null) {
        computed_description.types[i] = null;
      }
    }

    for (const [key, value] of Object.entries(description.columns)) {
      if (value === null) {
        computed_description.columns[key] = null;
      }
    }

    // console.log(computed_description);

    deepStrictEqual(computed_description, description);

    // @ts-expect-error unknown
    return await sql<DescriptionTypes<R>[]>(template, ...args).execute();
    } catch (error) {
    console.error(err)
    throw error
  }
  };
}

// https://github.com/porsager/postgres/blob/rewrite/src/types.js
type DescriptionTypes<T> = {
  -readonly [K in keyof T]: T[K] extends 23 | 701
    ? number
    : T[K] extends 1043
    ? string
    : T[K] extends 16
    ? boolean
    : T[K] extends 17
    ? Uint8Array
    : T[K] extends null
    ? string
    : unknown;
};
/*
const results = await typedSql(
  sql,
  description
)`SELECT * FROM users WHERE id = ${1} AND away = ${false}`;

console.log(results);

console.log(results[0].type);

await sql.end();
*/
