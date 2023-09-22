/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import type { OutgoingHttpHeaders } from "node:http2";
import type { PendingQuery, Row } from "postgres";
import type { z } from "zod";
import type { ResponseType, userSchema } from "../lib/routes.js";
import { entityRoutes } from "../lib/routes.js";
import { sql } from "./database.js";
import { EntitySorting } from "../client/entity-list/pw-order.js";

// Mapped Types
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

type magic<K extends keyof (typeof entityRoutes)> = {
  [P in K]: typeof entityRoutes[P];
}[K];

type EntityRoutesResponse<K extends keyof (typeof entityRoutes)> = {
  [P in K]: EntityRoutesResponseInternal<P>;
}[K];

type EntityRoutesResponseInternal<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<typeof entityRoutes[P]["response"]>;
}[K];

type EntityRoutesResponseIntermediate<K extends keyof (typeof entityRoutes)> = {
  [P in K]: {
    entities: EntityRoutesResponseEntities<P>,
    previousCursor: EntityRoutesResponsePreviousCursor<P>,
    nextCursor: EntityRoutesResponseNextCursor<P>,
  };
}[K];

type EntityRoutesResponseEntities<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<typeof entityRoutes[P]["response"]["shape"]["entities"]>;
}[K];

type EntityRoutesResponsePreviousCursor<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<typeof entityRoutes[P]["response"]["shape"]["previousCursor"]>;
}[K];

type EntityRoutesResponseNextCursor<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<typeof entityRoutes[P]["response"]["shape"]["previousCursor"]>;
}[K];

type entityRoutesRequest<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<typeof entityRoutes[P]["request"]>;
}[K];

type entityRoutesRequestPaginationCursor<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<typeof entityRoutes[P]["request"]>["paginationCursor"];
}[K];

type entitiesType2<K extends keyof (typeof entityRoutes)> = {
  [P in K]: {
    [R in
      z.infer<
        typeof entityRoutes[P]["request"]
      >["sorting"][number][0]]: z.infer<
      typeof entityRoutes[P]["request"]
    >["sorting"][number][1];
  };
}[K];

type entitiesType9<K extends keyof (typeof entityRoutes)> = {
  [P in K]: {
    [R in
      z.infer<
        typeof entityRoutes[P]["request"]
      >["sorting"][number][0]]: z.infer<
      typeof entityRoutes[P]["request"]
    >["sorting"][number][2];
  };
}[K];

type entitiesType4<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number];
}[K];

type entitiesType18<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][0];
}[K];

type entitiesType8<K extends keyof (typeof entityRoutes)> = {
  [P in K]: {
    [key in z.infer<
      typeof entityRoutes[P]["request"]
    >["sorting"][number][0]]: (
      order: entitiesType2<P>[key],
      paginationDirection: "forwards" | "backwards",
      v: entitiesType9<P>[key],
    ) => PendingQuery<Row[]>;
  };
}[K];

export async function fetchData<R extends keyof typeof entityRoutes>(
  loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>,
  path: R,
  query: entityRoutesRequest<R>,
  sqlQuery: (query: entityRoutesRequest<R>) => PendingQuery<Row[]>,
  orderByQueries: entitiesType8<R>,
  tiebreaker: entitiesType18<R> | undefined,
): Promise<[OutgoingHttpHeaders, ResponseType<R>]> {
  const sorting: EntitySorting<R>[] = query.sorting;

  if (tiebreaker !== undefined && !sorting.find((e) => e[0] === tiebreaker)) {
    sorting.push([tiebreaker, "ASC", null]);
  }

  // TODO FIXME id tiebreaker lost
  console.log(sorting);

  const orderByQueryParts = sorting.flatMap(v => {
    return [
      sql`,`,

      sql`${orderByQueries[v[0]](v[1], query.paginationDirection, v[2])}`,
    ];
  }).slice(1);

  const orderByQuery =
    orderByQueryParts.length == 0
      ? sql``
      : orderByQueryParts.reduce<PendingQuery<Row[]>>(
          (prev, curr) => sql`${prev}${curr}`,
          sql` ORDER BY `,
        );

  const paginationCursor: entityRoutesRequestPaginationCursor<R> =
    query.paginationCursor;

  let sqlResult;
  if (!paginationCursor) {
    sqlResult = await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.id', ${loggedInUser.id}::text, true);`;
      await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}::text, true);`;
      return entityRoutes[path].response.shape.entities.parse(await tsql`${sql`(${sqlQuery(query)} ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`}`);
    });
  } else {
    // TODO test with pagination step 10 and 11 null values
    // test group,type
    // test type,group
    // test group,id
    // test id,group

    const queries = sorting.map((value, index) => {
      const part = sorting.slice(0, index + 1);

      const partsTmp = part.flatMap<PendingQuery<Row[]>>((value, index) => {
        let order: PendingQuery<Row[]>;

        const value0 = value[0];
        const cursorValue = paginationCursor
          ? paginationCursor[value0]
          : null;
        const column = sql.unsafe(`"${value[0]}"`);
        if (index === part.length - 1) {
          switch (value[1]) {
            case "ASC":
              // ASC is NULLS LAST by default
              switch (query.paginationDirection) {
                case "forwards":
                  order = sql`(${cursorValue} < ${column} ${
                    paginationCursor == null || cursorValue !== null
                      ? sql`OR ${column} IS NULL`
                      : sql``
                  })`;
                  break;
                case "backwards":
                  order = sql`(${cursorValue} > ${column} ${
                    paginationCursor == null || cursorValue === null
                      ? sql`OR ${column} IS NULL`
                      : sql``
                  })`;
                  break;
                default:
                  throw new Error("unreachable")
              }
              break;
            case "DESC":
              // DESC is NULLS FIRST by default
              switch (query.paginationDirection) {
                case "forwards":
                  order = sql`(${cursorValue} > ${column} ${
                    paginationCursor == null || cursorValue === null
                      ? sql`OR ${column} IS NULL`
                      : sql``
                  })`;
                  break;
                case "backwards":
                  order = sql` (${cursorValue} < ${column} ${
                    paginationCursor == null || cursorValue !== null
                      ? sql`OR ${column} IS NULL`
                      : sql``
                  })`;
                  break;
                default:
                  throw new Error("unreachable")
              }
              break;
            default:
              throw new Error("unreachable")
          }
        } else {
          // this is probably not compatible with the checks above
          order = sql`${cursorValue} IS NOT DISTINCT FROM ${column}`;
        }
        const result = [sql` AND `, order];
        return result
      });

      const parts = partsTmp
        .slice(1)
        .reduce((prev, curr) => sql`${prev}${curr}`);

      return sql`(${sqlQuery(
        query,
      )} AND (${parts}) ${orderByQuery} LIMIT ${query.paginationLimit + 1})`;
    });

    sqlResult = await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.id', ${loggedInUser.id}::text, true);`;
      await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}::text, true);`;
      if (queries.length == 1) {
        return entityRoutes[path].response.shape.entities.parse(await tsql`${queries[0]}`);
      } else {
        return entityRoutes[path].response.shape.entities.parse(await tsql`${queries
          .reverse()
          .flatMap((v) => [sql`\nUNION ALL\n`, v])
          .slice(1)
          .reduce((prev, curr) => sql`${prev}${curr}`)} LIMIT ${
          query.paginationLimit + 1
        }`);
      }
    });
  }

  // would be great to stream the results but they are post processed below
  let entities: EntityRoutesResponseEntities<R> = sqlResult;

  let nextCursor: EntityRoutesResponseNextCursor<R> = null;
  let previousCursor: EntityRoutesResponsePreviousCursor<R> =
    null;
  // TODO FIXME also recalculate the other cursor because data could've been deleted in between / the filters have changed
  if (query.paginationDirection === "forwards") {
    if (query.paginationCursor) {
      previousCursor = entities[0] ?? null;
    }
    if (entities.length > query.paginationLimit) {
      entities.pop();
      nextCursor = entities[entities.length - 1] ?? null;
    }
  } else if (query.paginationDirection === "backwards") {
    entities = entities.reverse(); // fixup as we needed to switch up orders above
    if (entities.length > query.paginationLimit) {
      entities.shift();
      previousCursor = entities[0] ?? null;
    }
    if (query.paginationCursor) {
      nextCursor = entities[entities.length - 1] ?? null;
    }
  }

  const y: EntityRoutesResponseIntermediate<R> = {
    entities: entities,
    nextCursor: nextCursor,
    previousCursor: previousCursor,
  };

  const zefw: EntityRoutesResponse<R> = y;

  const a = {
    success: true as const,
    data: zefw,
  };

  return [
    {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
    },
    a,
  ];
}
