// https://github.com/porsager/postgres/
// https://www.postgresql.org/docs/current/protocol.html

import type { WritableTemplateStringsArray } from "../../lib/types";

// postgres can "Extended Query" execute BEGIN; and COMMIT;? seems like yes
// https://www.postgresql.org/docs/current/protocol-message-types.html
// https://www.postgresql.org/docs/current/protocol-message-formats.html

// the postgres binary format doesnt seem to be specified but I think would still be worth to implement for performance

// https://github.com/porsager/postgres-benchmarks

export function unsafe2(string: string): [TemplateStringsArray, ...any[]] {
  let r: import("../../lib/types").WritableTemplateStringsArray = [string];
  r.raw = [string];
  return [r as TemplateStringsArray];
}

export function sql2(_strings: TemplateStringsArray, ..._keys: (string | [TemplateStringsArray, ...(string | string[] | boolean | number)[]] | [TemplateStringsArray, ...(string | string[] | boolean | number)[]][] | string[] | boolean | number)[]): [TemplateStringsArray, ...(string | string[] | boolean | number)[]] {
  const strings = _strings;
  const keys = _keys;
  //console.log("sql", strings, keys)

  const r: import("../../lib/types").WritableTemplateStringsArray = [""];
  r.raw = [""];

  const rd: import("../../lib/types").WritableTemplateStringsArray = ["", ""];
  rd.raw = ["", ""];

  const stringsAsTemplates = strings.map(unsafe2);

  // array of templates
  const flattened: [TemplateStringsArray, ...(string | string[] | boolean | number)[]][] = stringsAsTemplates.flatMap((m, i) => {
    if (i == keys.length) {
      return [m];
    }
    // array of flat template strings.
    const val = keys[i];
    if (
      Array.isArray(val) &&
      [...val].every(
        (p) => Array.isArray(p) && typeof p[0] === "object" && "raw" in p[0]
      )
    ) {
      return [m, ...val];
    }
    // flat template string
    if (Array.isArray(val) && typeof val[0] === "object" && "raw" in val[0]) {
      return [m, keys[i]];
    }
    // primitive
    return [m, [rd, keys[i]]];
  });
  //console.log("flattened", flattened)

  const result = flattened.reduce((previous, current) => {
    const templateStrings: WritableTemplateStringsArray = [
      ...previous[0].slice(0, -1),
      previous[0].slice(-1)[0] + current[0][0],
      ...current[0].slice(1),
    ];
    templateStrings.raw = [
      ...previous[0].raw.slice(0, -1),
      previous[0].raw.slice(-1)[0] + current[0].raw[0],
      ...current[0].raw.slice(1),
    ];
    return [
      templateStrings as TemplateStringsArray,
      ...previous.slice(1),
      ...current.slice(1),
    ] as [TemplateStringsArray, ...any[]];
  }, ([r]) as [TemplateStringsArray, ...any[]]);

  //console.log("result", result)

  return result;
}

export function sql2ToString(sql: [TemplateStringsArray, ...(string | string[] | boolean | number)[]]) {
  return sql[0]
    .map((s, i) => {
      if (i + 1 == sql.length) {
        return s;
      }
      return s + JSON.stringify(sql[i + 1]);
    })
    .join("");
}

/*
console.log(sql2`SELECT * FROM test`)
console.log(sql2`SELECT ${"hill"}`)
console.log(sql2`SELECT ${sql2`* FROM test`} WHERE ${1}`)
/** @type {any[]} */
/*
let list = ["id", "title", "info"];

console.log(sql2`SELECT "id", "title", "info", "place" FROM projects WHERE 1${list.map(
  (v) => sql2` AND (${unsafe2(v)} < ${1})`
)} OR NOT ... params() ORDER BY ${list.map(
  (v) => sql2`${unsafe2(v)} ASC, `
)} LIMIT 1337`);
*/
