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
  const r: WritableTemplateStringsArray = [String(string)];
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
  const rtmp: WritableTemplateStringsArray = [""];
  rtmp.raw = [""];
  // @ts-expect-error this seems to be impossible to type
  const r: TemplateStringsArray = rtmp;

  const rdtmp: WritableTemplateStringsArray = ["", ""];
  rdtmp.raw = ["", ""];
  // @ts-expect-error this seems to be impossible to type
  const rd: TemplateStringsArray = rdtmp;

  // join the strings and the interpolated values
  // into an array of templates
  const flattened = strings.flatMap<[
    TemplateStringsArray,
    ...(null | string | string[] | boolean | number | Buffer)[]
  ]>((m: string, i: number) => {
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
      const val2: ([TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]] 

      | [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]][] 

      | string[]) = [...val];

      const isTemplateString: (r: ([TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]]

      | [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]][] 

      | string[])) => r is [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]] = (r): r is [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]] => typeof r[0] === "object" && "raw" in r[0];

      // this is not actually checked (obviously - how should it)
      const isTemplateStringArray: (r: ([TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]]

      | [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]][] 

      | string[])) => r is [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]][] = (r): r is [TemplateStringsArray, ...(string | number | boolean | string[] | Buffer | null)[]][] => typeof r[0][0] === "object" && "raw" in r[0][0];
     
      // array of flat template strings.
      if (
        // https://github.com/microsoft/TypeScript/issues/17002
        // https://github.com/micros^oft/TypeScript/pull/42316
        isTemplateStringArray(val2)
      ) {
        const returnValue: [
          TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][] = [unsafe2(m), ...val2];
        return returnValue
      }
      // flat template string
      else if (isTemplateString(val2)) {
        const returnValue: [
          TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][] = [unsafe2(m), val2];
        return returnValue
      } else {
        // string array, same as primitive
        // primitive
        const returnValue: [
          TemplateStringsArray,
          ...(null | string | string[] | boolean | number | Buffer)[]
        ][] = [unsafe2(m), [rd, val2]];
        return returnValue
      }
    } else {
      // primitive
      const returnValue: [
        TemplateStringsArray,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ][] = [unsafe2(m), [rd, val]];
      return returnValue
    }
  });

  // convert this array of flat templates into a template
  const result = flattened.reduce(
    (previous, current) => {
      const writableTemplateStrings: WritableTemplateStringsArray = [
        ...previous[0].slice(0, -1), // previous except last
        previous[0].slice(-1)[0] + current[0][0], // previous last + current first 
        ...current[0].slice(1), // current except first
      ];
      writableTemplateStrings.raw = [
        ...previous[0].raw.slice(0, -1),
        previous[0].raw.slice(-1)[0] + current[0].raw[0],
        ...current[0].raw.slice(1),
      ];
      // @ts-expect-error probably not typeable
      const templateStrings: TemplateStringsArray = writableTemplateStrings;

      const [_1, ...a] = previous
      const [_2, ...b] = current
      const returnValue: [
        TemplateStringsArray,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ] = [
        templateStrings,
         ...a, // except template strings
          ...b // except template strings
        ];
      return returnValue
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

const list = ["id", "title", "info"];

console.log(sql2`SELECT "id", "title", "info", "place" FROM projects WHERE 1${list.map(
  (v) => sql2` AND (${unsafe2(v)} < ${1})`
)} OR NOT ... params() ORDER BY ${list.map(
  (v) => sql2`${unsafe2(v)} ASC, `
)}LIMIT 1337`);
