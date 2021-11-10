// https://github.com/porsager/postgres/

import { inspect } from "node:util";

// https://www.postgresql.org/docs/current/protocol.html

// postgres can "Extended Query" execute BEGIN; and COMMIT;? seems like yes
// https://www.postgresql.org/docs/current/protocol-message-types.html
// https://www.postgresql.org/docs/current/protocol-message-formats.html

// the postgres binary format doesnt seem to be specified but I think would still be worth to implement for performance

// https://github.com/porsager/postgres-benchmarks

/**
 *
 * @param {string} string
 * @returns {[TemplateStringsArray, ...any[]]}
 */
export function unsafe(string) {
  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let r = [string];
  r.raw = [string];
  const r2 = /** @type {TemplateStringsArray} */ (r);
  return [r2];
}

/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...(string|[TemplateStringsArray, ...any[]]|[TemplateStringsArray, ...any[]][]|string[]|boolean|number)} keys
 * @returns {any}
 */
export function sql(strings, ...keys) {
  return [strings, ...keys];

  return {
    /**
     * @template T
     */
    execute: async () => {
      return /** @type {T} */ (/** @type {unknown} */ (undefined));
    },
  };
}

/** @type {any[]} */
let list = [];

sql`SELECT "id", "title", "info", "place" FROM projects WHERE 1 ${list.map(
  (v) => sql`AND ( ${unsafe(v)} < 5 )`
)} OR NOT ... params() ORDER BY ${list.map(
  (v) => sql`${unsafe(v)} ASC`
)} LIMIT 1337`;

// an array of Sql gets concatenated
// an Sql gets inserted
// other values get prepared-statements

// probably make the execute a wrapper to porsager for now because I wont have the time to fully implement a postgres client lib
//await sql`SELECT 1`.execute()

/**
 * 
 * @param {[TemplateStringsArray, ...any[]][]} array 
 * @returns {[TemplateStringsArray, ...any[]]}
 */
export function internalMerge(array) {
  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let r = [""];
  r.raw = [""];
  const r2 = /** @type {TemplateStringsArray} */ (r);

  return array.reduce((previous, current) => {
    /** @type {import("../../lib/types").WritableTemplateStringsArray} */
    const templateStrings = [
      ...previous[0].slice(0, -1),
      previous[0].slice(-1)[0] + current[0][0],
      ...current[0].slice(1)
    ];
    templateStrings.raw = [
      ...previous[0].raw.slice(0, -1),
      previous[0].raw.slice(-1)[0] + current[0].raw[0],
      ...current[0].raw.slice(1)
    ];
    return /** @type {[TemplateStringsArray, ...any[]]} */ ([/** @type {TemplateStringsArray} */ (templateStrings), ...(previous[1] || []), ...(current[1] || [])]);
  }, /** @type {[TemplateStringsArray, ...any[]]} */ ([r]));
}

/**
 *
 * @param {string|[TemplateStringsArray, ...any[]]|[TemplateStringsArray, ...any[]][]|boolean|number|null} _object
 * @returns {[TemplateStringsArray, ...any[]]} this must be one with flattened keys (so only primitives)
 */
 export function sqlFlatten(_object) {
  const object = _object;
  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let r = [""];
  r.raw = [""];
  const r2 = /** @type {TemplateStringsArray} */ (r);

  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let rd = ["", ""];
  rd.raw = ["", ""];
  const rd2 = /** @type {TemplateStringsArray} */ (rd);

  if (object == null || typeof object === "string" || typeof object === "number" || typeof object === "boolean") return [rd2, object];

  // [TemplateStringsArray, ...any[]][]
  if (Array.isArray(object) && (typeof object[0] !== "object" || !('raw' in object[0]))) {
    return internalMerge(object.map(sqlFlatten))
  }

  // [TemplateStringsArray, ...any[]]
  if (Array.isArray(object) && typeof object[0] === "object" && 'raw' in object[0]) {
    return internalMerge(object[0].map((_, i) => {
      if (i == object[0].length - 1) {
        /** @type {import("../../lib/types").WritableTemplateStringsArray} */
        let rf = [object[0][i]];
        rf.raw = [object[0].raw[i]]
        const rf2 = /** @type {TemplateStringsArray} */ (rf);

        return [rf2];
      } else {
        /** @type {import("../../lib/types").WritableTemplateStringsArray} */
        let rm = [object[0][i], ""];
        rm.raw = [object[0][i], ""];
        const rm2 = /** @type {TemplateStringsArray} */ (rm);
        return /** @type {[TemplateStringsArray, ...any[]]} */ ([rm2, sqlFlatten(object[i+1])])
      }
    }))
  }
}

/**
 *
 * @param {string|Sql|Sql[]|string[]|boolean|number|null} object
 * @returns {string}
 */
export function sqlToString(object) {
  if (object instanceof Sql) {
    return object.strings
      .map((string, i) => {
        if (object.strings.length - 1 == i) return string;
        return string + sqlToString(object.keys[i]);
      })
      .join("");
  }
  if (Array.isArray(object)) {
    return object.map(sqlToString).join("");
  }
  if (object === null) {
    return "NULL";
  }
  return object.toString();
}

//console.log(sqlFlatten(sql`SELECT * FROM test`))
console.log(sqlFlatten(sql`SE ${"hi"}`))
//console.log(sqlFlatten(sql`SELECT ${sql`* FROM test`} WHERE ${1}`))
