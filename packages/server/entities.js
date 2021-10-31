import { sql } from './src/sql/index.js'

/**
 * @template T
 * @param {string} table 
 * @param {string[]} fieldsToSelect 
 * @param {{ [field: string]: 'nulls-first'|'nulls-last' }} orderByInfo
 * @param {import("projektwahl-lit-lib/src/types").BaseQuery<T>} query
 * @param {T} sanitizedData 
 * @param {(query: T) => import('./src/sql').Sql} customFilterQuery 
 */
export async function fetchData(table, fieldsToSelect, orderByInfo, query, sanitizedData, customFilterQuery) {
    // orderBy needs to be reversed for backwards pagination
    if (query.paginationDirection === "backwards") {
        query.sorting = query.sorting.map(v => [v[0], v[1]==="ASC"?"DESC":"ASC"])
    }

    const paginationQuery = sql``

    sql`SELECT ${sql(fieldsToSelect.join(", "))} FROM ${sql(table)} WHERE ${query.paginationCursor === null} OR (${customFilterQuery(sanitizedData)}) AND (${paginationQuery}) LIMIT ${query.paginationLimit+1}`
}