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
import type { entityRoutes, ResponseType, userSchema } from "../lib/routes.js";
import { sql } from "./database.js";
import { mappedFunctionCall2, mappedIndexing } from "../lib/result.js";

// Mapped Types
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

type entitiesType = {
  [K in keyof typeof entityRoutes]: typeof entityRoutes[K];
};

type entitiesType0 = {
  [K in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[K]["request"]>;
};

type entitiesType1 = {
  [K in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[K]["request"]
  >["sorting"][number][0];
};

type entitiesType2 = {
  [K in keyof typeof entityRoutes]: {
    [R in z.infer<
      typeof entityRoutes[K]["request"]
    >["sorting"][number][0]]: z.infer<
      typeof entityRoutes[K]["request"]
    >["sorting"][number][1];
  };
};

type entitiesType9 = {
  [K in keyof typeof entityRoutes]: {
    [R in z.infer<
      typeof entityRoutes[K]["request"]
    >["sorting"][number][0]]: z.infer<
      typeof entityRoutes[K]["request"]
    >["sorting"][number][2];
  };
};

type entitiesType4 = {
  [K in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[K]["request"]
  >["sorting"][number];
};

type entitiesType15 = {
  [K in keyof typeof entityRoutes]: Array<
    z.infer<typeof entityRoutes[K]["request"]>["sorting"][number]
  >;
};

type entitiesType18 = {
  [K in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[K]["request"]
  >["sorting"][number][0];
};

type entitiesType6 = {
  [K in keyof typeof entityRoutes]: entitiesType4[K][0];
};

type entitiesType10 = {
  [K in keyof typeof entityRoutes]: entitiesType4[K][2];
};

type entitiesType8 = {
  [K in keyof typeof entityRoutes]: {
    [key in entitiesType1[K]]: (
      order: entitiesType2[K][key],
      paginationDirection: "forwards" | "backwards",
      v: entitiesType9[K][key]
    ) => PendingQuery<Row[]>;
  };
};

export async function fetchData<R extends keyof typeof entityRoutes>(
  loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>,
  path: R,
  query: entitiesType0[R],
  sqlQuery: (query: entitiesType0[R]) => PendingQuery<Row[]>,
  orderByQueries: entitiesType8[R],
  tiebreaker: entitiesType18[R] | undefined
): Promise<[OutgoingHttpHeaders, ResponseType<R>]> {
  const sorting: entitiesType15[R] = mappedIndexing(query, "sorting");

  if (tiebreaker !== undefined && !sorting.find((e) => e[0] == tiebreaker)) {
    
    sorting.push([tiebreaker, "ASC", null]);
  }

  // TODO FIXME id tiebreaker lost
  console.log(sorting);

  const orderByQueryParts = mappedFunctionCall2(
    sorting,
    (v: entitiesType4[R]) => {
      const v0: entitiesType6[R] = mappedIndexing<entitiesType4, R, 0>(v, 0);
      
      const v1: entitiesType2[R][typeof v0] = mappedIndexing(v, 1);
      const v2: entitiesType10[R] = mappedIndexing(v, 2);
      return [
        sql`,`,
        
        sql`${orderByQueries[v0](v1, query.paginationDirection, v2)}`,
      ];
    }
  ).slice(1);

  const orderByQuery =
    orderByQueryParts.length == 0
      ? sql``
      : orderByQueryParts.reduce<PendingQuery<Row[]>>(
          (prev, curr) => sql`${prev}${curr}`,
          sql` ORDER BY `
        );

  const paginationCursor: entitiesType0[R]["paginationCursor"] =
    query.paginationCursor;

  let sqlResult;
  if (!paginationCursor) {
    sqlResult = await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.id', ${loggedInUser.id}::text, true);`;
      await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}::text, true);`;
      return await tsql`${sql`(${sqlQuery(query)} ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`}`;
    });
  } else {
    // TODO test with pagination step 10 and 11 null values
    // test group,type
    // test type,group
    // test group,id
    // test id,group

    const queries = sorting.map((value, index) => {
      const part = sorting.slice(0, index + 1);

      const partsTmp = part.flatMap((value, index) => {
        let order;
        
        const cursorValue = paginationCursor
          ? 
            paginationCursor[value[0]]
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
              }
              break;
          }
        } else {
          // this is probably not compatible with the checks above
          order = sql`${cursorValue} IS NOT DISTINCT FROM ${column}`;
        }
        return [sql` AND `, order];
      });

      const parts = partsTmp
        .slice(1)
        .reduce((prev, curr) => sql`${prev}${curr}`);

      return sql`(${sqlQuery(query)} AND (${parts}) ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`;
    });

    await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.id', ${loggedInUser.id}::text, true);`;
      await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}::text, true);`;
      if (queries.length == 1) {
        sqlResult = await tsql`${queries[0]}`;
      } else {
        sqlResult = await tsql`${queries
          .reverse()
          .flatMap((v) => [sql`\nUNION ALL\n`, v])
          .slice(1)
          .reduce((prev, curr) => sql`${prev}${curr}`)} LIMIT ${
          query.paginationLimit + 1
        }`;
      }
    });
  }

  // would be great to stream the results but they are post processed below

  let entities: z.infer<entitiesType[R]["response"]>["entities"] =
    
    sqlResult as unknown as z.infer<entitiesType[R]["response"]>["entities"];

  let nextCursor: z.infer<entitiesType[R]["response"]>["nextCursor"] = null;
  let previousCursor: z.infer<entitiesType[R]["response"]>["previousCursor"] =
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

  const y = {
    entities: entities,
    nextCursor: nextCursor,
    previousCursor: previousCursor,
  };

  const a = {
    success: true as const,
    data: y,
  };

  return [
    {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
    },
    
    a,
  ];
}
