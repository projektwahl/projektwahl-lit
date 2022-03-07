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

// TODO FIXME maybe implement without the .raw stuff because I don't think we need it?

export function unsafe2(
  string: null | string | number | symbol
): [ReadonlyArray<string>] {
  return [[String(string)]];
}

export function sql2(
  strings: ReadonlyArray<string>, // template strings
  ..._keys: (
    | null // value
    | string // value
    | [
      ReadonlyArray<string>,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ] // single nested sql2
    | [
      ReadonlyArray<string>,
        ...(null | string | string[] | boolean | number | Buffer)[]
      ][] // array of nested sql2
  //  | string[]
    | boolean // value
    | number // value
    | Buffer // value
  )[]
): [
  ReadonlyArray<string>,
  ...(null | string | string[] | boolean | number | Buffer)[]
] {
  const keys = _keys;

  const r: ReadonlyArray<string> = [""];

  const rd: ReadonlyArray<string> = ["", ""];

  // join the strings and the interpolated values
  // into an array of templates
  const flattened: [
    ReadonlyArray<string>,
    ...(string | string[] | boolean | number)[]
  ][] = strings.flatMap((m, i) => {
    // the last value has nothing interpolated left so just add it directly
    if (i == keys.length) {
      return [unsafe2(m)];
    }
    const val = keys[i];
    // array of flat template strings.
    if (
      Array.isArray(val) &&
      [...val].every(
        (p) => Array.isArray(p) && typeof p[0] === "object"
      )
    ) {
      return [unsafe2(m), ...val];
    }
    // flat template string
    if (Array.isArray(val) && typeof val[0] === "object") {
      return [unsafe2(m), val];
    }
    // primitive
    return [unsafe2(m), [rd, val]];
  });
  //console.log("flattened", flattened)

  const result = flattened.reduce(
    (previous, current) => {
      const templateStrings: ReadonlyArray<string> = [
        ...previous[0].slice(0, -1),
        previous[0].slice(-1)[0] + current[0][0],
        ...current[0].slice(1),
      ];
      return [templateStrings, ...previous.slice(1), ...current.slice(1)];
    },
    [r]
  );

  //console.log("result", result)

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
