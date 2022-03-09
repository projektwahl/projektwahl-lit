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
  openid_id: z.string().nullable(),
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
    openid_id: true,
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
) => {
  return z
    .object({
      paginationDirection: z
        .enum(["forwards", "backwards"])
        .default("forwards"),
      paginationCursor: s.partial().nullish(), // if this is null the start is at start/end depending on paginationDirection
      filters: s.partial(),
      sorting: z
        .array(
          z.tuple([
            z.enum(
              // As we can't guarantee at least one element this probably will never be possible
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
};

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

// TODO FIXME possible strict by default?
export const routes = {
  "/api/v1/logout": {
    request: z.any(),
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
  "/api/v1/openid-login": {
    request: z.any(),
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
    request: z.undefined(),
    response: z.object({}).strict(),
  },
  "/api/v1/update": {
    request: z.undefined(),
    response: z.object({}).strict(),
  },
  "/api/v1/users/create": {
    request: rawUserSchema
      .pick({
        openid_id: true,
        age: true,
        away: true,
        group: true,
        type: true,
        username: true,
        deleted: true,
      })
      .extend({
        password: z.string().optional(),
      })
      .strict(),
    response: createOrUpdateUserResponse(rawUserSchema).strict(),
  },
  "/api/v1/users/update": {
    request: rawUserSchema
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
        password: z.string(),
      })
      .partial()
      .extend({
        id: z.number(),
      })
      .strict(),
    response: createOrUpdateUserResponse(rawUserSchema).strict(),
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
  "/api/v1/users": {
    request: baseQuery(rawUserSchema),
    response: z
      .object({
        entities: z.array(users(rawUserSchema)),
        previousCursor: users(rawUserSchema).nullable(),
        nextCursor: users(rawUserSchema).nullable(),
      })
      .strict(),
  },
  "/api/v1/projects": {
    request: baseQuery(rawProjectSchema),
    response: z
      .object({
        entities: z.array(project),
        previousCursor: project.nullable(),
        nextCursor: project.nullable(),
      })
      .strict(),
  },
  "/api/v1/choices": {
    request: baseQuery(rawChoiceNullable.merge(rawProjectSchema)),
    response: z
      .object({
        entities: z.array(choices),
        previousCursor: choices.nullable(),
        nextCursor: choices.nullable(),
      })
      .strict(),
  },
  "/api/v1/choices/update": {
    request: rawChoiceNullable
      .pick({
        project_id: true,
        rank: true,
      })
      .strict(),
    response: z.object({}).strict(),
  },
} as const;

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
