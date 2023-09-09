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

import { z, ZodObject, ZodType, ZodTypeAny, ZodTypeDef } from "zod";
import type { entityRoutes, UnknownKeysParam } from "./routes.js";

export const successResult = <
  T extends Record<string, ZodTypeAny>,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
>(
  s: ZodObject<T, UnknownKeys, Catchall>,
) =>
  z
    .object({
      success: z.literal(true),
      data: s,
    })
    .strict();

// TODO FIXME UPDATE TO zod error schema
export const failureResult = <
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  s: ZodType<Output, Def, Input>,
) =>
  z
    .object({
      success: z.literal(false),
      error: s,
    })
    .strict();

export const result = <
  T extends Record<string, ZodTypeAny>,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
>(
  s: ZodObject<T, UnknownKeys, Catchall>,
) => z.union([successResult(s), failureResult(z.record(z.string()))]);

export type ToIndexed<
  T extends Record<string, { [inner in I]: unknown }>,
  I extends string | number | symbol,
> = {
  [K in keyof T]: T[K][I];
};

export function mappedIndexing<
  T extends Record<string, { [inner in I]: unknown }>,
  K extends string,
  I extends string | number | symbol,
>(value: T[K], index: I): ToIndexed<T, I>[K] {
  return value[index];
}

export function mappedIndexingSet<
  T extends Record<string, { [inner in I]: unknown }>,
  K extends string,
  I extends string | number | symbol,
>(value: T[K], index: I, newValue: ToIndexed<T, I>[K]): void {
  value[index] = newValue;
}

export type ToTuple<
  K extends string | symbol | number,
  T extends { [key in K]: unknown },
  Q extends { [key in K]: unknown },
  R extends { [key in K]: unknown },
> = {
  [key in K]: [T[key], Q[key], R[key]];
};

export function mappedTuple<
  K extends string | number | symbol,
  T extends { [key in K]: unknown },
  Q extends { [key in K]: unknown },
  R extends { [key in K]: unknown },
>(path: K, value1: T[K], value2: Q[K], value3: R[K]): ToTuple<K, T, Q, R>[K] {
  return [value1, value2, value3];
}

export function testa<Output>(zodtype: ZodType<Output>, data: unknown): Output {
  return zodtype.parse(data);
}

export type MappedFunctionCallType<T extends Record<string, ZodType<unknown>>> =
  {
    [K in keyof T]: T[K]["_output"];
  };

export function mappedFunctionCall<
  T extends Record<string, ZodType<unknown>>,
  K extends string,
>(schema: T[K], value: unknown): MappedFunctionCallType<T>[K] {
  return testa(schema, value);
}

type entitiesType15 = {
  [K in keyof typeof entityRoutes]: entitiesType4[K][];
};

type entitiesType4 = {
  [K in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[K]["request"]
  >["sorting"][number];
};

export function mappedFunctionCall2<R extends keyof typeof entityRoutes, U>(
  array: entitiesType15[R],
  functio: (v: entitiesType4[R]) => readonly U[],
): U[] {
  return array.flatMap(functio);
}
