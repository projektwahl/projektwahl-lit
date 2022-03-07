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
// https://github.com/porsager/postgres/
// https://www.postgresql.org/docs/current/protocol.html

// postgres can "Extended Query" execute BEGIN; and COMMIT;? seems like yes
// https://www.postgresql.org/docs/current/protocol-message-types.html
// https://www.postgresql.org/docs/current/protocol-message-formats.html

// the postgres binary format doesnt seem to be specified but I think would still be worth to implement for performance

// https://github.com/porsager/postgres-benchmarks

export interface WritableTemplateStringsArray extends Array<string> {
  raw?: readonly string[];
}

export function unsafe2(
  string: null | string | number | symbol
): [TemplateStringsArray] {
  const r: WritableTemplateStringsArray = [];
  r.raw = [String(string)];
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return [r as TemplateStringsArray]
}

export function sql2(
  strings: TemplateStringsArray, // template strings
  ...keys: readonly (
    | null // value
    | string // value
    | ([
      TemplateStringsArray,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ]) // single nested sql2
    | ([
      TemplateStringsArray,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ][]) // array of nested sql2
    | (string[]) // pass array value in prepared statement
    | boolean // value
    | number // value
    | Buffer // value
  )[]
): [
  TemplateStringsArray,
  ...(null | string | string[] | boolean | number | Buffer)[]
] {
  const r: WritableTemplateStringsArray = [""];
  r.raw = [""];

  const rd: WritableTemplateStringsArray = ["", ""];
  rd.raw = ["", ""];

  // join the strings and the interpolated values
  // into an array of templates
  const flattened: [
    TemplateStringsArray,
    ...(null | string | string[] | boolean | number | Buffer)[]
  ][] = strings.flatMap<[
    TemplateStringsArray,
    ...(null | string | string[] | boolean | number | Buffer)[]
  ][]>((m: string, i: number) => {
    // the last value has nothing interpolated left so just add it directly
    if (i == keys.length) {
      const returnValue: [
        TemplateStringsArray,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ][] = [unsafe2(m)];
      return returnValue
    }
    const val = keys[i];

    if (Array.isArray(val)) {
      const val2: Array<null // value
      | string // value
      | ([
        TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ]) // single nested sql2
      | ([
        TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][]) // array of nested sql2
      | (string[]) // pass array value in prepared statement
      | boolean // value
      | number // value
      | Buffer // value
      > = [...val];

      const isTemplateOrStringArr: (arg: null // value
      | string // value
      | ([
        TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ]) // single nested sql2
      | ([
        TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][]) // array of nested sql2
      | (string[]) // pass array value in prepared statement
      | boolean // value
      | number // value
      | Buffer // value
      ) => arg is (([
        TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][]) | (string[])) = Array.isArray;

      // @ts-expect-error wrong isArray types
      const isTemplateString1: (r: TemplateStringsArray | string) => r is TemplateStringsArray = Array.isArray

      const isTemplateString2: (r: [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]] | string[] | readonly string[]) => r is [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]] = (r): r is [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]] => isTemplateString1(r[0])

      // array of flat template strings.
      if (
        // https://github.com/microsoft/TypeScript/issues/17002
        // https://github.com/micros^oft/TypeScript/pull/42316
        val2.every<(([
          TemplateStringsArray,
            ...(null | string | string[] | boolean | number | Buffer)[]
          ][]) | (string[]))>(
          isTemplateOrStringArr
        )
      ) {

        val2
        // dammit we can differentiate these as far as I can tell - we need the raw back...
        const val3: [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]][] | string[][] | readonly string[][] = val2;

        

        if (val3.every(isTemplateString2)) {
          const returnValue: [
            TemplateStringsArray,
            ...(null | string | string[] | boolean | number | Buffer)[]
          ][] = [unsafe2(m), ...val3];
          return returnValue
        }
      }
      // flat template string
      if (typeof val[0] === "object") {
        const returnValue: [
          TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][] = [unsafe2(m), val];
        return returnValue
      }
    }
    // primitive
    return [unsafe2(m), [rd, val]];
  });

  // convert this array of flat templates into a template
  const result = flattened.reduce(
    (previous, current) => {
      const templateStrings: TemplateStringsArray = [
        ...previous[0].slice(0, -1), // previous except last
        previous[0].slice(-1)[0] + current[0][0], // previous last + current first 
        ...current[0].slice(1), // current except first
      ];
      return [
        templateStrings,
         ...previous.slice(1), // except template strings
          ...current.slice(1) // except template strings
        ];
    },
    [r]
  );

  return result;
}

export function sql2ToString(
  sql: [ReadonlyArray<string>, ...(string | string[] | boolean | number)[]]
) {
  return sql[0]
    .map((s, i) => {
      if (i + 1 == sql.length) {
        return s;
      }
      return s + JSON.stringify(sql[i + 1]);
    })
    .join("");
}


console.log(sql2`SELECT * FROM test`)
console.log(sql2`SELECT ${"hill"}`)
console.log(sql2`SELECT ${sql2`* FROM test`} WHERE ${1}`)
/** @type {any[]} */

let list = ["id", "title", "info"];

console.log(sql2`SELECT "id", "title", "info", "place" FROM projects WHERE 1${list.map(
  (v) => sql2` AND (${unsafe2(v)} < ${1})`
)} OR NOT ... params() ORDER BY ${list.map(
  (v) => sql2`${unsafe2(v)} ASC, `
)} LIMIT 1337`);
