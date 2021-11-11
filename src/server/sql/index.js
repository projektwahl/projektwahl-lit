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
  return [/** @type {TemplateStringsArray} */ (r)];
}

/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...(string|[TemplateStringsArray, ...any[]]|[TemplateStringsArray, ...any[]][]|string[]|boolean|number)} keys
 * @returns {any}
 */
export function sql(strings, ...keys) {
  // TODO FIXME maybe flatten here this should be way easier...

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

// array of templates
// templates
// other primitives

/**
 *
 * @param {string|[TemplateStringsArray, ...any[]]|[TemplateStringsArray, ...any[]][]|boolean|number|null} _object
 * @returns {[TemplateStringsArray, ...any[]]} this must be one with flattened keys (so only primitives)
 */
 export function sqlFlatten(_object) {
  console.log(_object)
  const object = _object;
  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  const r = [""];
  r.raw = [""];

  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  const rd = ["", ""];
  rd.raw = ["", ""];

  if (Array.isArray(object) && object.every(p => Array.isArray(p) && typeof p[0] === "object" && 'raw' in p[0])) {
    const object2 = /** @type {[TemplateStringsArray, ...any[]][]} */ (object);

    console.log("array", object2)

    const flattenedArgs = object2//.map(sqlFlatten)

    /** @type {import("../../lib/types").WritableTemplateStringsArray} */
    let r = [""];
    r.raw = [""];

    return flattenedArgs.reduce((previous, current) => {
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
      return /** @type {[TemplateStringsArray, ...any[]]} */ ([/** @type {TemplateStringsArray} */ (templateStrings), ...previous.slice(1), ...current.slice(1)]);
    }, /** @type {[TemplateStringsArray, ...any[]]} */ ([r]));
  }

  if (Array.isArray(object) && typeof object[0] === "object" && 'raw' in object[0]) {
    const object2 = /** @type {[TemplateStringsArray, ...any[]]} */ (object);

    console.log("template", object2)

    if (object2.length == 1) return object2;
    
    const mapped2 = object2[0].map(unsafe) // this should be one longer

    const mapped = object.slice(1).map(sqlFlatten)

    const flattened = mapped2.flatMap((m, i) => i == mapped.length ? [m] : [m, mapped[i]])

    console.log("flattened", flattened)

    return sqlFlatten(flattened)
  }

  console.log("other", object)

  return [/** @type {TemplateStringsArray} */ (rd), object];
}

console.log(sqlFlatten(sql`SELECT * FROM test`))
console.log(sqlFlatten(sql`SELECT ${"hill"}`))
console.log(sqlFlatten(sql`SELECT ${sql`* FROM test`} WHERE ${1}`))
/** @type {any[]} */
let list = ["id", "title", "info"];

console.log(sqlFlatten(sql`SELECT "id", "title", "info", "place" FROM projects WHERE 1 ${list.map(
  (v) => sql`AND ( ${unsafe(v)} < 5 )`
)} OR NOT ... params() ORDER BY ${list.map(
  (v) => sql`${unsafe(v)} ASC`
)} LIMIT 1337`));
