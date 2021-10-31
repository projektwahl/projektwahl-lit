// https://github.com/porsager/postgres/

// https://www.postgresql.org/docs/current/protocol.html

// postgres can "Extended Query" execute BEGIN; and COMMIT;? seems like yes
// https://www.postgresql.org/docs/current/protocol-message-types.html
// https://www.postgresql.org/docs/current/protocol-message-formats.html

// the postgres binary format doesnt seem to be specified but I think would still be worth to implement for performance


// https://github.com/porsager/postgres-benchmarks

/** @typedef {number} Sql */

/**
 * 
 * @param {*} strings 
 * @param  {...any} keys 
 * @returns {Sql}
 */
function sql(strings, ...keys) {
    return 1
}

/** @type {any[]} */
let list = [];

sql`SELECT "id", "title", "info", "place" FROM projects WHERE 1 ${list.map((v) => sql`AND ( ${sql(v)} < 5 )`)} OR NOT ... params() ORDER BY ${list.map(v => sql`${sql(v)} ASC`)} LIMIT 1337`

// an array of Sql gets concatenated
// an Sql gets inserted
// other values get prepared-statements

// probably make the execute a wrapper to porsager for now because I wont have the time to fully implement a postgres client lib
await sql`SELECT 1`.execute()
