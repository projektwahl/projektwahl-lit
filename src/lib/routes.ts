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

const rawChoice = z
  .object({
    rank: z.number(),
    project_id: z.number(),
    user_id: z.number(),
  })
  .strict();

const rawChoiceNullable = z
  .object({
    rank: z.number().nullable(),
    project_id: z.number().nullable(),
    user_id: z.number().nullable(),
  })
  .strict();

const rawUserCommon = {
  id: z.number(),
  username: z.string().min(1).max(100),
  openid_id: z.string().optional(),
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
    group: z.string().min(1).max(100).nullable(),
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

export const rawSessionType = z.object({
  session_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  user_id: z.number(),
});

// TODO FIXME can we remove this?
export type keys =
  | "/api/v1/choices/update"
  | "/api/v1/login"
  | "/api/v1/logout"
  | "/api/v1/openid-login"
  | "/api/v1/redirect"
  | "/api/v1/sleep"
  | "/api/v1/update"
  | "/api/v1/users/create"
  | "/api/v1/users/update"
  | "/api/v1/projects/create"
  | "/api/v1/projects/update"
  | "/api/v1/users"
  | "/api/v1/projects";

const userMapper = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  s.pick({
    id: true,
    type: true,
    username: true,
    group: true,
    age: true,
  });

export const userSchema = userMapper(rawUserSchema).optional();

function identity<
  T extends {
    [r in keys]: {
      request: z.ZodTypeAny;
      response: z.ZodTypeAny;
    };
  }
>(v: T) {
  return v;
}

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

export const entities = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  entity: ZodObject<T, UnknownKeys, Catchall>
) =>
  result(
    z.object({
      entities: z.array(entity),
      previousCursor: entity.nullable(),
      nextCursor: entity.nullable(),
    })
  );

const users = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  s.pick({
    id: true,
    type: true,
    username: true,
    group: true,
    age: true,
    away: true,
    project_leader_id: true,
    force_in_project_id: true,
    deleted: true,
  });

const createOrUpdateUserResponse = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  s.pick({
    id: true,
    project_leader_id: true,
    force_in_project_id: true,
  });

const project = rawProjectSchema.pick({
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
});

const baseQuery = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  z
    .object({
      paginationDirection: z
        .enum(["forwards", "backwards"])
        .default("forwards"),
      paginationCursor: s.partial().nullish(), // if this is null the start is at start/end depending on paginationDirection
      // @ts-expect-error why
      filters: s.partial().default({}),
      sorting: z
        .array(
          z.tuple([
            z.enum(
              Object.keys(s.shape) as [
                keyof T & string,
                ...(keyof T & string)[]
              ]
            ),
            z.enum(["ASC", "DESC"]),
          ])
        )
        .default([]),
      paginationLimit: z.number().default(100),
    })
    .strict();

const choices = rawChoiceNullable.merge(
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
);

export const routes = identity({
  "/api/v1/logout": {
    request: z.any(),
    response: z.object({}),
  },
  "/api/v1/login": {
    request: z
      .object({
        username: z.string().min(1).max(100),
        password: z.string(),
      })
      .strict(),
    response: z.object({}),
  },
  "/api/v1/openid-login": {
    request: z.any(),
    response: z.object({}),
  },
  "/api/v1/redirect": {
    request: z.any(),
    response: z.object({}),
  },
  "/api/v1/sleep": {
    request: z.undefined(),
    response: z.object({}),
  },
  "/api/v1/update": {
    request: z.undefined(),
    response: z.object({}),
  },
  "/api/v1/users/create": {
    request: rawUserSchema
      .pick({
        age: true,
        away: true,
        group: true,
        type: true,
        username: true,
        deleted: true,
      })
      .extend({
        password: z.string().optional(),
      }),
    response: createOrUpdateUserResponse(rawUserSchema),
  },
  "/api/v1/users/update": {
    request: rawUserSchema
      .pick({
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
        password: z.string(),
      })
      .partial()
      .extend({
        id: z.number(),
      }),
    response: createOrUpdateUserResponse(rawUserSchema),
  },
  "/api/v1/projects/create": {
    request: rawProjectSchema.pick({
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
    }),
    response: z.object({}).extend({ id: z.number() }),
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
      }),
    response: z.object({}).extend({ id: z.number() }),
  },
  "/api/v1/users": {
    request: baseQuery(rawUserSchema),
    response: z.object({
      entities: z.array(users(rawUserSchema)),
      previousCursor: users(rawUserSchema).nullable(),
      nextCursor: users(rawUserSchema).nullable(),
    }),
  },
  "/api/v1/projects": {
    request: baseQuery(rawProjectSchema),
    response: z.object({
      entities: z.array(project),
      previousCursor: project.nullable(),
      nextCursor: project.nullable(),
    }),
  },
  "/api/v1/choices": {
    request: baseQuery(rawChoiceNullable.merge(rawProjectSchema)),
    response: z.object({
      entities: z.array(choices),
      previousCursor: choices.nullable(),
      nextCursor: choices.nullable(),
    }),
  },
  "/api/v1/choices/update": {
    request: rawChoiceNullable.pick({
      project_id: true,
      user_id: true,
      rank: true,
    }),
    response: z.object({}),
  },
} as const);

export const entityRoutes = {
  "/api/v1/users": routes["/api/v1/users"],
  "/api/v1/projects": routes["/api/v1/projects"],
  "/api/v1/choices": routes["/api/v1/choices"],
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
