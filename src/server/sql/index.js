// https://github.com/porsager/postgres/

// https://www.postgresql.org/docs/current/protocol.html

// postgres can "Extended Query" execute BEGIN; and COMMIT;? seems like yes
// https://www.postgresql.org/docs/current/protocol-message-types.html
// https://www.postgresql.org/docs/current/protocol-message-formats.html

// the postgres binary format doesnt seem to be specified but I think would still be worth to implement for performance

// https://github.com/porsager/postgres-benchmarks

export class Sql {
  /**
   *
   * @param {TemplateStringsArray} strings
   * @param  {(string|Sql|Sql[]|string[]|boolean|number)[]} keys
   */
  constructor(strings, keys) {
    this.strings = strings;
    this.keys = keys;
  }
}

/**
 *
 * @param {string} string
 * @returns {Sql}
 */
export function unsafe(string) {
  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let r = [string];
  r.raw = [string];
  const r2 = /** @type {TemplateStringsArray} */ (r);
  return new Sql(r2, []);
}

/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...(string|Sql|Sql[]|string[]|boolean|number)} keys
 * @returns {any}
 */
export function sql(strings, ...keys) {
  return new Sql(strings, keys);

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
 * @param {string|Sql|Sql[]|string[]|boolean|number|null} object
 * @returns {[TemplateStringsArray, ...any[]]}
 */
 export function sqlFlatten(object) {
  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let r = [""];
  r.raw = [""];
  const r2 = /** @type {TemplateStringsArray} */ (r);

  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  let rd = ["", ""];
  rd.raw = ["", ""];
  const rd2 = /** @type {TemplateStringsArray} */ (rd);

  if (object instanceof Sql) {
    return internalMerge(object.strings.map((_, i) => {
      if (i == object.strings.length - 1) {
        /** @type {import("../../lib/types").WritableTemplateStringsArray} */
        let rf = [object.strings[i]];
        rf.raw = [object.strings.raw[i]]
        const rf2 = /** @type {TemplateStringsArray} */ (rf);

        return [rf2];
      } else {
        /** @type {import("../../lib/types").WritableTemplateStringsArray} */
        let rm = [object.strings[i], ""];
        rm.raw = [object.strings[i], ""];
        const rm2 = /** @type {TemplateStringsArray} */ (rm);
        return /** @type {[TemplateStringsArray, ...any[]]} */ ([rm2, sqlFlatten(object.keys[i])])
      }
    }))
  }
  if (Array.isArray(object)) {
    return internalMerge(object.map(sqlFlatten))
  }
  return [rd2, object];
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

console.log(sqlFlatten(sql`SELECT * FROM test`))
console.log(sqlFlatten(sql`SELECT ${"hi"}`))
//console.log(sqlFlatten(sql`SELECT ${sql`* FROM test`} WHERE ${1}`))
