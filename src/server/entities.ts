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
import type { z } from "zod";
import { entityRoutes, ResponseType } from "../lib/routes.js";
import { sql } from "./database.js";
import { sql2, unsafe2 } from "./sql/index.js";

// Mapped Types
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

type entitesType = {
  [K in keyof typeof entityRoutes]: typeof entityRoutes[K];
};

type mappedInfer1<R extends keyof typeof entityRoutes> = {
  [K in keyof z.infer<entitesType[R]["response"]>]: z.infer<
    entitesType[R]["response"]
  >[K];
};

type entitesType0 = {
  [K in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[K]["request"]>;
};

export function updateField<
  E extends { [name: string]: boolean | string | number | null },
  K extends keyof E
>(table: string, entity: E, name: K) {
  return sql2`"${unsafe2(name)}" = CASE WHEN ${
    entity[name] !== undefined
  } THEN ${entity[name] ?? null} ELSE "${unsafe2(table)}"."${unsafe2(
    name
  )}" END`;
}

export async function fetchData<R extends keyof typeof entityRoutes>(
  path: R,
  query: entitesType0[R],
  sqlQuery: (
    query: entitesType0[R]
  ) => [
    TemplateStringsArray,
    ...(null | string | string[] | boolean | number | Buffer)[]
  ],
  nullOrdering: {
    [key: string]: "smallest" | "largest";
  }
  /*{
          id: "nulls-first",
          type: "nulls-first",
          username: "nulls-first",
          password_hash: "nulls-first",
        },*/
): Promise<[OutgoingHttpHeaders, ResponseType<R>]> {
  const entitySchema: entitesType[R] = entityRoutes[path];

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (!(query.sorting as [string, "ASC"|"DESC"][]).find((e) => e[0] == "id")) {
    query.sorting.push(["id", "ASC"]);
  }

  // orderBy needs to be reversed for backwards pagination
  if (query.paginationDirection === "backwards") {
    let s: z.infer<typeof entityRoutes[R]["request"]>["sorting"] = query.sorting;
    s = s.map<z.infer<typeof entityRoutes[R]["request"]>["sorting"][number]>((v: z.infer<typeof entityRoutes[R]["request"]>["sorting"][number]) => [
      v[0],
      v[1] === "ASC" ? "DESC" : "ASC",
    ]);
    query.sorting = s;
  }

  const orderByQuery = query.sorting
    .flatMap((v) => [
      sql2`,`,
      sql2`${unsafe2(v[0])} ${unsafe2(v[1])} ${unsafe2(
        v[1] === "ASC"
          ? nullOrdering[v[0]] === "smallest"
            ? "NULLS FIRST"
            : "NULLS LAST"
          : nullOrdering[v[0]] === "smallest"
          ? "NULLS LAST"
          : "NULLS FIRST"
      )}`,
    ])
    .slice(1);

  const paginationCursor: entitesType0[R]["paginationCursor"] =
    query.paginationCursor;

  let finalQuery;
  if (!paginationCursor) {
    finalQuery = sql2`(${sqlQuery(query)} ORDER BY ${orderByQuery} LIMIT ${
      query.paginationLimit + 1
    })`;
  } else {
    const queries = query.sorting.map((value, index) => {
      const part = query.sorting.slice(0, index + 1);

      const parts = part
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

      return sql2`(${sqlQuery(
        query
      )} AND (${parts}) ORDER BY ${orderByQuery} LIMIT ${
        query.paginationLimit + 1
      })`;
    });

    if (queries.length == 1) {
      finalQuery = queries[0];
    } else {
      finalQuery = sql2`${queries
        .flatMap((v) => [sql2`\nUNION ALL\n`, v])
        .slice(1)} LIMIT ${query.paginationLimit + 1}`;
    }
  }

  const entitiesSchema = entitySchema["response"]["shape"]["entities"];

  const sqlResult = await sql(...finalQuery);

  console.log(sqlResult);

  let entities: z.infer<entitesType[R]["response"]>["entities"] =
    entitiesSchema.parse(sqlResult);

  // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/lib/list-entities.ts#L30

  let nextCursor: z.infer<entitesType[R]["response"]>["nextCursor"] = null;
  let previousCursor: z.infer<entitesType[R]["response"]>["previousCursor"] =
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
