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
  VArray,
  VBoolean,
  VDiscriminatedUnion,
  VEnum,
  VNullable,
  VNumber,
  VObject,
  VPick,
  VSchema,
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

export const rawUserSchema = new VDiscriminatedUnion("type", [
  new VObject({
    type: new VEnum(["voter"]),
    group: new VNullable(new VString(0, 100)),
    age: new VNullable(new VNumber(0, 200)),
    ...rawUserCommon,
  }),
  new VObject({
    type: new VEnum(["admin"]),
    ...rawUserCommon,
  }),
  new VObject({
    type: new VEnum(["helper"]),
    ...rawUserCommon,
  })
])

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
export const userSchema = new VPick(rawUserSchema,
    ["id", "type", "username", "group","age"]) // .optional();

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

export const entities = <
  T
>(
  entity: VSchema<T>
) =>
  result(
    new VObject({
      entities: new VArray(entity),
      previousCursor: new VNullable(entity),
      nextCursor: new VNullable(entity),
    })
  );

const baseQuery = <
  T1,
  T2,
  T3,
>(
  s: VSchema<T1>,
  sorting: VSchema<T2>,
  filters: VSchema<T3>
) => {
  return {
    request: new VObject({
        paginationDirection: new VEnum(["forwards", "backwards"]),
        paginationCursor: new VNullable(s),
        filters,
        sorting,
        paginationLimit: new VNumber(),
      }),
    response: new VObject({
        entities: new VArray(s),
        previousCursor: new VNullable(s),
        nextCursor: new VNullable(s),
      }),
  };
};

export const createUserAction = new VPick(rawUserSchema,
  ["openid_id", "age", "away", "group", "type", "username","deleted"])
  .partial({
    deleted: true,
    group: true,
    age: true,
    away: true,
  })
  .extend({
    password: z.optional(z.string().min(1)),
    action: z.literal("create"),
  });

export const updateUserAction = new VPick(rawUserSchema,
  ["openid_id", "age", "away", "group", "type", "username", "project_leader_id", "force_in_project_id", "deleted"])
  .extend({
    password: z.optional(z.string().min(1)),
  })
  .partial()
  .extend({
    id: new VNumber(),
    action: new VEnum(["update"]),
  });

export const routes = {
  "/api/v1/logout": {
    request: new VObject({}),
    response: new VObject({}),
  },
  "/api/v1/login": {
    request: new VObject({
        username: new VString(1, 100),
        password: new VString(),
      }),
    response: new VObject({}),
  },
  "/api/v1/sudo": {
    request: new VObject({
        id: new VNumber(),
      }),
    response: new VObject({}),
  },
  "/api/v1/openid-login": {
    request: new VObject({}),
    response: new VObject({}),
  },
  "/api/v1/redirect": {
    request: new VObject({
        session_state: new VString(),
        code: new VString(),
      }),
    response: new VObject({}),
  },
  "/api/v1/sleep": {
    request: new VObject({}),
    response: new VObject({}),
  },
  "/api/v1/update": {
    request: new VObject({}),
    response: new VObject({}),
  },
  "/api/v1/users/create-or-update": {
    request: new VArray(
      new VDiscriminatedUnion("action", [
        createUserAction,
        updateUserAction,
      ])
    ),
    response: new VArray(
      new VPick(rawUserSchema, ["id", "project_leader_id", "force_in_project_id",])
    ),
  },
  "/api/v1/projects/create": {
    request: new VPick(rawProjectSchema,
      [ "costs", "deleted", "info", "max_age", "max_participants", "min_age", "min_participants", "place", "random_assignments", "title"]),
    response: new VObject({ id: new VNumber() }),
  },
  "/api/v1/projects/update": {
    request: new VPick(rawProjectSchema, ["costs", "deleted","info","max_age","max_participants", "min_age","min_participants","place","random_assignments","title"])
      .partial()
      .extend({
        id: z.number(),
      })
      ,
    response: new VObject({ id: new VNumber() }),
  },
  "/api/v1/users": baseQuery(
    new VPick(rawUserSchema,
     ["id","type","username","openid_id","group","age","away","project_leader_id","force_in_project_id","deleted",])
      .partial({
        openid_id: true,
        force_in_project_id: true,
      })
      ,
    new VArray(
        z.union([
          z.tuple([
            new VEnum(["id"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["username"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["type"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["project_leader_id_eq"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNumber(),
          ]),
          z.tuple([
            new VEnum(["force_in_project_id_eq"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNumber(),
          ]),
        ])
      )
    new VPick(rawUserSchema,
      ["id","username","type","project_leader_id","force_in_project_id","deleted"])
      .partial()
  ),
  "/api/v1/projects": baseQuery(
    new VPick(rawProjectSchema, ["id","title","info","place","costs","min_age","max_age","min_participants","max_participants","random_assignments","deleted"]),
    z
      .array(
        z.union([
          z.tuple([
            new VEnuml(["id"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["title"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["info"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["project_leader_id_eq"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNumber(),
          ]),
          z.tuple([
            new VEnum(["force_in_project_id_eq"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNumber(),
          ]),
        ])
      )
    new VPick(rawProjectSchema,["id","title","info","deleted"])
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
            new VEnum(["id"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["title"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
          ]),
          z.tuple([
            new VEnum(["rank"] as const),
            new VEnum(["ASC", "DESC"] as const),
            new VNullable(),
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
      
      .partial()
  ),
  "/api/v1/choices/update": {
    request: new VPick(rawChoiceNullable,
     ["project_id","rank"]),
    response: z.object({}),
  },
  "/api/v1/sessions": baseQuery(
    rawSessionType,
    new VArray(
      z.tuple([
        new VEnum(["session_id"] as const),
        new VEnum(["ASC", "DESC"] as const),
        new VNullable(),
      ])
    ),
    new VObject({
        user_id: new VNullable(new VNumber()),
      })
      
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
