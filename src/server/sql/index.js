// https://github.com/porsager/postgres/
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
 * @param {TemplateStringsArray} _strings
 * @param  {...(string|[TemplateStringsArray, ...(string|string[]|boolean|number)[]]|[TemplateStringsArray, ...(string|string[]|boolean|number)[]][]|string[]|boolean|number)} _keys
 * @returns {any}
 */
export function sql(_strings, ..._keys) {
  const strings = _strings;
  const keys = _keys;
  console.log("sql", strings, keys)

  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  const r = [""];
  r.raw = [""];

  /** @type {import("../../lib/types").WritableTemplateStringsArray} */
  const rd = ["", ""];
  rd.raw = ["", ""];

  const stringsAsTemplates = strings.map(unsafe)

  // array of templates
  /** @type {[TemplateStringsArray, ...(string|string[]|boolean|number)[]][]} */
  const flattened = stringsAsTemplates.flatMap((m, i) => {
    if (i == keys.length) {
      return [m];
    }
    // array of flat template strings
    if (Array.isArray(keys[i]) && keys[i].every(p => Array.isArray(p) && typeof p[0] === "object" && 'raw' in p[0])) {
      return [m, ...keys[i]]
    }
    // flat template string
    if (Array.isArray(keys[i]) && typeof keys[i][0] === "object" && 'raw' in keys[i][0]) {
      return [m, keys[i]];
    }
    // primitive
    return [m, [rd, keys[i]]];
  })
  console.log("flattened", flattened)

  const result = flattened.reduce((previous, current) => {
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

  console.log("result", result)

  return result

  return {
    /**
     * @template T
     */
    then: async () => {
      return /** @type {T} */ (/** @type {unknown} */ (undefined));
    },
  };
}

console.log(sql`SELECT * FROM test`)
console.log(sql`SELECT ${"hill"}`)
console.log(sql`SELECT ${sql`* FROM test`} WHERE ${1}`)
/** @type {any[]} */
let list = ["id", "title", "info"];

console.log(sql`SELECT "id", "title", "info", "place" FROM projects WHERE 1${list.map(
  (v) => sql` AND (${unsafe(v)} < ${1})`
)} OR NOT ... params() ORDER BY ${list.map(
  (v) => sql`${unsafe(v)} ASC, `
)} LIMIT 1337`);
