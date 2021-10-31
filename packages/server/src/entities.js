import { literal, Sql, sql, sqlToString } from './sql/index.js'

/**
 * @template T
 * @param {string} table 
 * @param {string[]} fieldsToSelect 
 * @param {{ [field: string]: 'nulls-first'|'nulls-last' }} orderByInfo
 * @param {import("projektwahl-lit-lib/src/types").BaseQuery<T>} query
 * @param {T} sanitizedData 
 * @param {(query: T) => import('./sql').Sql} customFilterQuery 
 * @returns {Sql}
 */
export function fetchData(table, fieldsToSelect, orderByInfo, query, sanitizedData, customFilterQuery) {
    // orderBy needs to be reversed for backwards pagination
    if (query.paginationDirection === "backwards") {
        query.sorting = query.sorting.map(v => [v[0], v[1]==="ASC"?"DESC":"ASC"])
    }

    if (query.sorting.length === 0) {
        query.sorting = [["id", "ASC"]]
    }

    const orderByQuery = query.sorting.flatMap(v => [sql`,`, sql`${v[0]} ${v[1]}`]).slice(1)

    
    if (query.paginationCursor === null) {
        return sql`(SELECT ${literal(fieldsToSelect.join(", "))} FROM ${literal(table)} WHERE ORDER BY ${orderByQuery} LIMIT ${query.paginationLimit+1})`
    } else {
        let queries = query.sorting.map((value, index, array) => {
            const part = query.sorting.slice(0, index + 1)
    
            let parts = part.flatMap((value, index) => {
                return [sql` AND `, sql`${query.paginationCursor[value[0]]??null} ${index === part.length - 1 ? (value[1] === "ASC" ? sql`<` : sql`>`) : sql`IS NOT DISTINCT FROM`} ${value[0] ?? null}`]
            }).slice(1);
    
    
            return sql`(SELECT ${literal(fieldsToSelect.join(", "))} FROM ${literal(table)} WHERE (${customFilterQuery(sanitizedData)}) AND (${parts}) ORDER BY ${orderByQuery} LIMIT ${query.paginationLimit+1})`
        });    

        return sql`${queries.flatMap(v => [sql`\nUNION ALL\n`, v]).slice(1)} LIMIT ${query.paginationLimit+1}`
    }
}

const value = fetchData("users", ["id", "type", "username", "password_hash"], { "id": "nulls-first", "type": "nulls-first", "username": "nulls-first", "password_hash": "nulls-first" }, {
    filters: {},
    paginationCursor: null,
    paginationDirection: "forwards",
    paginationLimit: 100,
    sorting: [["type", "DESC"], ["username", "ASC"], ["id", "DESC"]]
}, {
    name: "test"
}, (query) => {
    return sql`name IS NOT DISTINCT FROM ${query.name}`
})

console.log(sqlToString(value))