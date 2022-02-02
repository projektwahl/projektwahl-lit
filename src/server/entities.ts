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

type entitesType1<R extends keyof typeof entityRoutes> = {
  [K in keyof entitesType0]: entitesType0[R]["sorting"];
};

type entitesType2<R extends keyof typeof entityRoutes> = {
  [K in keyof entitesType0]: entitesType0[R]["paginationCursor"];
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
  table: string,
  columns: readonly [string, ...string[]],
  query: entitesType2[R],
  customFilterQuery: (
    query: entitesType2[R]
  ) => [
    TemplateStringsArray,
    ...(null | string | string[] | boolean | number | Buffer)[]
  ]
): Promise<[OutgoingHttpHeaders, ResponseType<R>]> {
  const entitySchema: entitesType[R] = entityRoutes[path];

  let sorting: entitesType1<R> = query.sorting

  if (!sorting.find((e) => e[0] == "id")) {
    sorting.push(["id", "ASC"]);
  }

  // orderBy needs to be reversed for backwards pagination
  if (query.paginationDirection === "backwards") {
    sorting = sorting.map((v) => [
      v[0],
      v[1] === "ASC" ? "DESC" : "ASC",
    ]);
  }

  const orderByQuery = sorting
    .flatMap((v) => [sql2`,`, sql2`${unsafe2(v[0])} ${unsafe2(v[1])}`])
    .slice(1);

  const paginationCursor: entitesType2<R> = query.paginationCursor;

  let finalQuery;
  if (!paginationCursor) {
    finalQuery = sql2`(SELECT ${unsafe2(
      columns.map((c) => `"${c}"`).join(", ")
    )} FROM ${unsafe2(table)} WHERE ${customFilterQuery(
      query
    )} ORDER BY ${orderByQuery} LIMIT ${query.paginationLimit + 1})`;
  } else {
    const queries = sorting.map((value, index) => {
      const part = sorting.slice(0, index + 1);

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

      return sql2`(SELECT ${unsafe2(columns.join(", "))} FROM ${unsafe2(
        table
      )} WHERE ${customFilterQuery(
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

  let entities: z.infer<entitesType[R]["response"]>["entities"] =
    entitiesSchema.parse(await sql(...finalQuery));

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
  } as mappedInfer1<R>;

  const a = {
    success: true as const,
    data: y,
  } as ResponseType<R>;

  return [
    {
      "content-type": "text/json; charset=utf-8",
      ":status": 200,
    },
    a,
  ];
}
