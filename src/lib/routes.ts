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
import {
  VBoolean,
  VNullable,
  VNumber,
  VObject,
  VString,
} from "./validation.js";

export const rawChoice = new VObject({
  rank: new VNumber(),
  project_id: new VNumber(),
  user_id: new VNumber(),
});

export const rawChoiceNullable = new VObject({
  rank: new VNullable(new VNumber()),
  project_id: new VNullable(new VNumber()),
  user_id: new VNullable(new VNumber()),
});

const rawUserCommon = {
  id: new VNumber(),
  username: new VString(1, 100),
  openid_id: new VNullable(new VString()), // nullish(),
  password_hash: new VString(),
  away: new VBoolean(),
  project_leader_id: new VNullable(new VNumber()),
  password_changed: new VBoolean(),
  force_in_project_id: new VNullable(new VNumber()),
  computed_in_project_id: new VNullable(new VNumber()),
  deleted: new VBoolean(),
  last_updated_by: new VNumber(),
};

export const rawUserSchema = new VObject({
  type: z.enum(["voter", "helper", "admin"]),
  // we can't use a discriminated union because it doesn't work with .pick()
  group: new VNullable(new VString(0, 100)),
  age: new VNullable(new VNumber(0, 200)),
  ...rawUserCommon,
});

export const rawProjectSchema = new VObject({
  id: new VNumber(),
  title: new VString(0, 1024),
  info: new VString(0, 8192),
  place: new VString(0, 1024),
  costs: new VNumber(0, 100),
  min_age: new VNumber(0, 200),
  max_age: new VNumber(0, 200),
  min_participants: new VNumber(1, 1000),
  max_participants: new VNumber(1, 1000),
  random_assignments: new VBoolean(),
  deleted: new VBoolean(),
  last_updated_by: new VNumber(),
});

export const rawSessionType = new VObject({
  session_id: new VString(),
  created_at: new VString(),
  updated_at: new VString(),
  user_id: new VNumber(),
});

// so now I either need pick or I need union

// pick would work on all object schemas and should be quite simple (and also nice to use)
// union would be not so nice to use but probably similar to implement.
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
    new VObject({
      entities: z.array(entity),
      previousCursor: entity.nullable(),
      nextCursor: entity.nullable(),
    })
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
        deleted: true,
      })
      .partial({
        openid_id: true,
        force_in_project_id: true,
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
            z.literal("project_leader_id_eq" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
          z.tuple([
            z.literal("force_in_project_id_eq" as const),
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
        deleted: true,
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
            z.literal("project_leader_id_eq" as const),
            z.enum(["ASC", "DESC"] as const),
            z.number(),
          ]),
          z.tuple([
            z.literal("force_in_project_id_eq" as const),
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
} as const;

export const entityRoutes = {
  "/api/v1/users": routes["/api/v1/users"],
  "/api/v1/projects": routes["/api/v1/projects"],
  "/api/v1/choices": routes["/api/v1/choices"],
  "/api/v1/sessions": routes["/api/v1/sessions"],
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
