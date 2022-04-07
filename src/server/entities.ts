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
  orderByQueries: entitiesType8[R]
): Promise<[OutgoingHttpHeaders, ResponseType<R>]> {
  const sorting: entitiesType15[R] = mappedIndexing(query, "sorting");

  if (!sorting.find((e) => e[0] == "id")) {
    sorting.push(["id", "ASC", null]);
  }

  const orderByQuery = mappedFunctionCall2(sorting, (v: entitiesType4[R]) => {
    const v0: entitiesType6[R] = mappedIndexing<entitiesType4, R, 0>(v, 0);
    // @ts-expect-error bruh
    const v1: entitiesType2[R][typeof v0] = mappedIndexing(v, 1);
    const v2: entitiesType10[R] = mappedIndexing(v, 2);
    return [
      sql`,`,
      // @ts-expect-error bruh
      sql`${orderByQueries[v0](v1, query.paginationDirection, v2)}`,
    ];
  })
    .slice(1)
    .reduce<PendingQuery<Row[]>>((prev, curr) => sql`${prev}${curr}`, sql``);

  const paginationCursor: entitiesType0[R]["paginationCursor"] =
    query.paginationCursor;

  let sqlResult;
  if (!paginationCursor) {
    sqlResult = await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}, true);`;
      return await tsql`${sql`(${sqlQuery(
        query
      )} ORDER BY ${orderByQuery} LIMIT ${query.paginationLimit + 1})`}`;
    });
  } else {
    const queries = sorting.map((value, index) => {
      const part = sorting.slice(0, index + 1);

      const parts = part
        .flatMap((value, index) => {
          return [
            sql` AND `,
            // @ts-expect-error this seems impossible to type - we probably need to unify this to the indexed type before
            sql`${paginationCursor ? paginationCursor[value[0]] : null} ${
              index === part.length - 1
                ? (value[1] === "ASC") !==
                  (query.paginationDirection === "backwards")
                  ? sql`<`
                  : sql`>`
                : sql`IS NOT DISTINCT FROM`
            } ${sql.unsafe(value[0] ?? null)}`,
          ];
        })
        .slice(1)
        .reduce((prev, curr) => sql`${prev}${curr}`);

      return sql`(${sqlQuery(
        query
      )} AND (${parts}) ORDER BY ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`;
    });

    await sql.begin(async (tsql) => {
      await tsql`SELECT set_config('projektwahl.type', ${loggedInUser.type}, true);`;
      if (queries.length == 1) {
        sqlResult = await tsql`${queries[0]}`;
      } else {
        sqlResult = await tsql`${queries
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
    // @ts-expect-error TODO FIXME
    a,
  ];
}
