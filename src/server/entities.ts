import type { OutgoingHttpHeaders } from "node:http2";
import type { Row } from "postgres";
import { z } from "zod";
import { keys, routes } from "../lib/routes.js";
import type { BaseQuery, FilterType } from "../lib/types.js";
import { sql } from "./database.js";
import { sql2, unsafe2 } from "./sql/index.js";

export async function fetchData<T extends { id: number; [index: string]: null | string | string[] | boolean | number }>(
  path: "/api/v1/users"|"/api/v1/projects",
  headers: import("http2").IncomingHttpHeaders,
  table: string,
  columns: readonly [string, ...string[]],
  filters: any,
  orderByInfo: { [field: string]: 'nulls-first' | 'nulls-last'; },
  customFilterQuery: (query: FilterType<T>) => [TemplateStringsArray, ...(null | string | string[] | boolean | number)[]]
): Promise<[OutgoingHttpHeaders, z.infer<typeof routes[typeof path]["response"]>]> {
  const url = new URL(headers[":path"]!, "https://localhost:8443");

  const pagination = z.object({
    p_cursor: z.string().refine(s => {
      try {
        JSON.parse(s);
      } catch (e) {
        return false;
      }
      return true;
    }, {
      message: "The cursor is invalid. This is an internal error."
    }).transform(s => JSON.parse(s)).optional(),
    p_direction: z.enum(["forwards", "backwards"]).default("forwards"),
    p_limit: z.number().default(100),
  }).parse(Object.fromEntries(url.searchParams as any))

  const sorting = z.array(z.tuple([z.enum(columns), z.enum(["ASC", "DESC"])])).parse(url.searchParams.getAll("order").map((o) => o.split("-")))

  let _query: BaseQuery<T> = {
    filters,
    paginationCursor: pagination.p_cursor,
    paginationDirection: pagination.p_direction,
    paginationLimit: pagination.p_limit,
    sorting
  }

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

  let finalQuery;
  if (!paginationCursor) {
    finalQuery = sql2`(SELECT ${unsafe2(columns.join(", "))} FROM ${unsafe2(
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
            sql2`${paginationCursor ? paginationCursor[value[0]] : null} ${
              index === part.length - 1
                ? value[1] === "ASC"
                  ? sql2`<`
                  : sql2`>`
                : sql2`IS NOT DISTINCT FROM`
            } ${unsafe2(value[0] ?? null)}`,
          ];
        })
        .slice(1);

      return sql2`(SELECT ${unsafe2(columns.join(", "))} FROM ${unsafe2(
        table
      )} WHERE ${customFilterQuery(
        query.filters
      )} AND (${parts}) ORDER BY ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`;
    });

    if (queries.length == 1) {
      finalQuery = queries[0]
    } else {
      finalQuery = sql2`${queries
        .flatMap((v) => [sql2`\nUNION ALL\n`, v])
        .slice(1)} LIMIT ${query.paginationLimit + 1}`;
    }
  }

    // [TemplateStringsArray, ...(null | string | string[] | boolean | number)[]]
    let entities = routes[path]["response"].shape.entities.parse(await sql(...finalQuery))

    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/lib/list-entities.ts#L30

    let nextCursor: z.infer<typeof routes[typeof path]["response"]>["entities"][0] | null = null;
		let previousCursor: z.infer<typeof routes[typeof path]["response"]>["entities"][0] | null = null;
		// TODO FIXME also recalculate the other cursor because data could've been deleted in between / the filters have changed
		if (pagination.p_direction === "forwards") {
			previousCursor = entities[0];
			if (entities.length > pagination.p_limit) {
				entities.pop();
				nextCursor = entities[entities.length - 1] ?? null;
			}
		} else if (pagination.p_direction === "backwards") {
			entities = entities.reverse(); // fixup as we needed to switch up orders above
			if (entities.length > pagination.p_limit) {
				entities.shift();
				previousCursor = entities[0] ?? null;
			}
			nextCursor = entities[entities.length - 1];
		}

    return [
      {
        "content-type": "text/json; charset=utf-8",
        ":status": 200,
      },
      // TODO FIXME
      {
        entities,
        nextCursor,
        previousCursor
      },
    ];
}
