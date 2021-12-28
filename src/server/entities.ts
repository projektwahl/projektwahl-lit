import type { BaseQuery, FilterType } from "../lib/types.js";
import { sql2, unsafe2 } from "./sql/index.js";

export function fetchData<T extends { id: number; [index: string]: string | string[] | boolean | number }>(
  table: string,
  fieldsToSelect: string[],
  orderByInfo: { [field: string]: 'nulls-first' | 'nulls-last'; },
  _query: BaseQuery<T>, // TODO FIXME sanitize
  customFilterQuery: (query: FilterType<T>) => [TemplateStringsArray, ...(string | string[] | boolean | number)[]]
): [TemplateStringsArray, ...(string | string[] | boolean | number)[]] {
  const query = _query;

  // orderBy needs to be reversed for backwards pagination
  if (query.paginationDirection === "backwards") {
    query.sorting = query.sorting.map((v) => [
      v[0],
      v[1] === "ASC" ? "DESC" : "ASC",
    ]);
  }

  if (query.sorting.length === 0) {
    query.sorting = [["id", "ASC"]];
  }

  const orderByQuery = query.sorting
    .flatMap((v) => [sql2`,`, sql2`${unsafe2(v[0])} ${unsafe2(v[1])}`])
    .slice(1);

  const paginationCursor = query.paginationCursor;

  if (paginationCursor === null) {
    return sql2`(SELECT ${unsafe2(fieldsToSelect.join(", "))} FROM ${unsafe2(
      table
    )} WHERE ${customFilterQuery(query.filters)} ORDER BY ${orderByQuery} LIMIT ${
      query.paginationLimit + 1
    })`;
  } else {
    let queries = query.sorting.map((value, index) => {
      const part = query.sorting.slice(0, index + 1);

      let parts = part
        .flatMap((value, index) => {
          return [
            sql2` AND `,
            sql2`${paginationCursor[value[0]]} ${
              index === part.length - 1
                ? value[1] === "ASC"
                  ? sql2`<`
                  : sql2`>`
                : sql2`IS NOT DISTINCT FROM`
            } ${unsafe2(value[0] ?? null)}`,
          ];
        })
        .slice(1);

      return sql2`(SELECT ${unsafe2(fieldsToSelect.join(", "))} FROM ${unsafe2(
        table
      )} WHERE ${customFilterQuery(
        query.filters
      )} AND (${parts}) ORDER BY ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`;
    });

    return sql2`${queries
      .flatMap((v) => [sql2`\nUNION ALL\n`, v])
      .slice(1)} LIMIT ${query.paginationLimit + 1}`;
  }
}
