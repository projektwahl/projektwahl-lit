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
import { z, ZodIssue, ZodObject, ZodTypeAny } from "zod";
import { result } from "./result.js";

export const rawChoice = z
  .object({
    rank: z.number(),
    project_id: z.number(),
    user_id: z.number(),
  })
  .strict();

export const rawChoiceNullable = z
  .object({
    rank: z.number().nullable(),
    project_id: z.number().nullable(),
    user_id: z.number().nullable(),
  })
  .strict();

const rawUserCommon = {
  id: z.number(),
  username: z.string().min(1).max(100),
  openid_id: z.string().nullish(),
  password_hash: z.string(),
  away: z.boolean(),
  project_leader_id: z.number().nullable(),
  password_changed: z.boolean(),
  force_in_project_id: z.number().nullable(),
  computed_in_project_id: z.number().nullable(),
  deleted: z.boolean(),
  last_updated_by: z.number(),
};

export const rawUserSchema = z
  .object({
    type: z.enum(["voter", "helper", "admin"]),
    // we can't use a discriminated union because it doesn't work with .pick()
    group: z.string().min(0).max(100).nullable(),
    age: z.number().min(0).max(200).nullable(),
    ...rawUserCommon,
  })
  .strict();

export const rawProjectSchema = z
  .object({
    id: z.number(),
    title: z.string().max(1024),
    info: z.string().max(8192),
    place: z.string().max(1024),
    costs: z.number().min(0).max(100),
    min_age: z.number().min(0).max(200),
    max_age: z.number().min(0).max(200),
    min_participants: z.number().min(1).max(1000),
    max_participants: z.number().min(1).max(1000),
    random_assignments: z.boolean(),
    deleted: z.boolean(),
    last_updated_by: z.number(),
  })
  .strict();

export const rawSessionType = z
  .object({
    session_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    user_id: z.number(),
  })
  .strict();

export const userSchema = rawUserSchema
  .pick({
    id: true,
    type: true,
    username: true,
    group: true,
    age: true,
  })
  .optional();

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

export const entities = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  entity: ZodObject<T, UnknownKeys, Catchall>
) =>
  result(
    z
      .object({
        entities: z.array(entity),
        previousCursor: entity.nullable(),
        nextCursor: entity.nullable(),
      })
      .strict()
  );

const baseQuery = <
  T1 extends { [k: string]: ZodTypeAny },
  T2 extends ZodTypeAny,
  T3 extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T1, UnknownKeys, Catchall>,
  sorting: T2,
  filters: T3
) => {
  return {
    request: z
      .object({
        paginationDirection: z
          .enum(["forwards", "backwards"])
          .default("forwards"),
        paginationCursor: s.nullish(),
        filters,
        sorting,
        paginationLimit: z.number().default(10),
      })
      .strict(),
    response: z
      .object({
        entities: z.array(s),
        previousCursor: s.nullable(),
        nextCursor: s.nullable(),
      })
      .strict(),
  };
};

export const createUserAction = rawUserSchema
  .pick({
    openid_id: true,
    age: true,
    away: true,
    group: true,
    type: true,
    username: true,
    deleted: true,
  })
  .partial({
    deleted: true,
    group: true,
    age: true,
    away: true,
  })
  .extend({
    password: z.optional(z.string().min(1)),
    action: z.literal("create"),
  })
  .strict();

export const updateUserAction = rawUserSchema
  .pick({
    openid_id: true,
    age: true,
    away: true,
    group: true,
    type: true,
    username: true,
    project_leader_id: true,
    force_in_project_id: true,
    deleted: true,
  })
  .extend({
    password: z.optional(z.string().min(1)),
  })
  .partial()
  .extend({
    id: z.number(),
    action: z.literal("update"),
  })
  .strict();

export const routes = {
  "/api/v1/logout": {
    request: z.object({}).strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/login": {
    request: z
      .object({
        username: z.string().min(1).max(100),
        password: z.string(),
      })
      .strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/sudo": {
    request: z
      .object({
        id: z.number(),
      })
      .strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/openid-login": {
    request: z.object({}).strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/redirect": {
    request: z
      .object({
        session_state: z.string(),
        code: z.string(),
      })
      .strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/sleep": {
    request: z.object({}).strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/update": {
    request: z.object({}).strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/users/create-or-update": {
    request: z.array(
      z.discriminatedUnion("action", [
        createUserAction.strict(),
        updateUserAction.strict(),
      ])
    ),
    response: z.array(
      rawUserSchema
        .pick({
          id: true,
          project_leader_id: true,
          force_in_project_id: true,
        })
        .strict()
    ),
  },
  "/api/v1/projects/create": {
    request: rawProjectSchema
      .pick({
        costs: true,
        deleted: true,
        info: true,
        max_age: true,
        max_participants: true,
        min_age: true,
        min_participants: true,
        place: true,
        random_assignments: true,
        title: true,
      })
      .strict(),
    response: z.object({}).extend({ id: z.number() }).strict(),
  },
  "/api/v1/projects/update": {
    request: rawProjectSchema
      .pick({
        costs: true,
        deleted: true,
        info: true,
        max_age: true,
        max_participants: true,
        min_age: true,
        min_participants: true,
        place: true,
        random_assignments: true,
        title: true,
      })
      .partial()
      .extend({
        id: z.number(),
      })
      .strict(),
    response: z.object({}).extend({ id: z.number() }).strict(),
  },
  "/api/v1/users": baseQuery(
    rawUserSchema
      .pick({
        id: true,
        type: true,
        username: true,
        openid_id: true,
        group: true,
        age: true,
        away: true,
        project_leader_id: true,
        force_in_project_id: true,
        computed_in_project_id: true,
        deleted: true,
      })
      .partial({
        openid_id: true,
        force_in_project_id: true,
        computed_in_project_id: true,
      })
      .extend({
        valid: z
          .enum(["valid", "invalid", "project_leader", "neutral"])
          .optional(),
      })
      .strict(),
    z
      .array(
        z.union([
          z.tuple([
            z.literal("id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("valid" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("username" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("type" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("group" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("project_leader_id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
          z.tuple([
            z.literal("force_in_project_id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
          z.tuple([
            z.literal("computed_in_project_id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
        ])
      )
      .default([]),
    rawUserSchema
      .pick({
        id: true,
        username: true,
        type: true,
        project_leader_id: true,
        force_in_project_id: true,
        computed_in_project_id: true,
        deleted: true,
        group: true,
      })
      .extend({
        valid: z
          .enum(["valid", "invalid", "project_leader", "neutral"])
          .optional(),
      })
      .strict()
      .partial()
  ),
  "/api/v1/projects": baseQuery(
    rawProjectSchema.pick({
      id: true,
      title: true,
      info: true,
      place: true,
      costs: true,
      min_age: true,
      max_age: true,
      min_participants: true,
      max_participants: true,
      random_assignments: true,
      deleted: true,
    }),
    z
      .array(
        z.union([
          z.tuple([
            z.literal("id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("title" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("info" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("project_leader_id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
          z.tuple([
            z.literal("force_in_project_id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
        ])
      )
      .default([]),
    rawProjectSchema
      .pick({
        id: true,
        title: true,
        info: true,
        deleted: true,
      })
      .strict()
      .partial()
  ),
  "/api/v1/choices": baseQuery(
    rawChoiceNullable.merge(
      rawProjectSchema.pick({
        id: true,
        title: true,
        info: true,
        place: true,
        costs: true,
        min_age: true,
        max_age: true,
        min_participants: true,
        max_participants: true,
        random_assignments: true,
        deleted: true,
      })
    ),
    z
      .array(
        z.union([
          z.tuple([
            z.literal("id" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("title" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
          z.tuple([
            z.literal("rank" as const),
            z.enum(["ASC", "DESC"] as const),
            z.null(),
          ]),
        ])
      )
      .default([]),
    rawChoiceNullable
      .merge(rawProjectSchema)
      .pick({
        id: true,
        title: true,
        info: true,
        rank: true,
      })
      .strict()
      .partial()
  ),
  "/api/v1/choices/update": {
    request: rawChoiceNullable
      .pick({
        project_id: true,
        rank: true,
      })
      .strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/settings/update": {
    request: z
      .object({
        open_date: z.string(),
        voting_start_date: z.string(),
        voting_end_date: z.string(),
        results_date: z.string(),
      })
      .strict(),
    response: z.object({}).strict(),
  },
  "/api/v1/sessions": baseQuery(
    rawSessionType,
    z.array(
      z.tuple([
        z.literal("session_id" as const),
        z.enum(["ASC", "DESC"] as const),
        z.null(),
      ])
    ),
    z
      .object({
        user_id: z.number().nullable(),
      })
      .strict()
  ),
  "/api/v1/settings": baseQuery(
    z
      .object({
        open_date: z.string(),
        voting_start_date: z.string(),
        voting_end_date: z.string(),
        results_date: z.string(),
      })
      .strict(),
    z.array(
      z.tuple([
        z.literal("fake_sort" as const),
        z.enum(["ASC", "DESC"] as const),
        z.null(),
      ])
    ),
    z.object({}).strict()
  ),
} as const;

export const entityRoutes = {
  "/api/v1/users": routes["/api/v1/users"],
  "/api/v1/projects": routes["/api/v1/projects"],
  "/api/v1/choices": routes["/api/v1/choices"],
  "/api/v1/sessions": routes["/api/v1/sessions"],
  "/api/v1/settings": routes["/api/v1/settings"],
};

export declare class MinimalZodError {
  issues: ZodIssue[];
}

export declare type MinimalSafeParseError = {
  success: false;
  error: MinimalZodError;
};

export type ResponseType<P extends keyof typeof routes> =
  | z.SafeParseSuccess<z.infer<typeof routes[P]["response"]>>
  | MinimalSafeParseError;
