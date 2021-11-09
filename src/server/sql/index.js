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
  let r = new String(string);
  r.raw = string;
  return new Sql([r], []);
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
 * @param {string|Sql|Sql[]|string[]|boolean|number|null} object
 * @returns {[TemplateStringsArray, ...any[]]}
 */
 export function sqlFlatten(object) {
  if (object instanceof Sql) {
    return [object.strings, ...object.keys]
  }
  if (Array.isArray(object)) {
    return object.reduce((previous, current) => {

    }, [[]]);
  }
  let r = new String("");
  r.raw = "";
  return [[r, r], object];
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

//console.log(sqlToString(sql`SELECT ${"hi"} 1 ${1}`))
