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
import { z, ZodIssue } from "zod";
import { result } from "./result.js";
import {
  VArray,
  VBoolean,
  VDiscriminatedUnion,
  VEnum,
  VMerge,
  VMergeUnion,
  VNullable,
  VNumber,
  VObject,
  VPartial,
  VPartialUnion,
  VPick,
  VPickUnion,
  VSchema,
  VString,
  VTuple,
  VUndefined,
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
    type: new VEnum(["voter"] as const),
    group: new VNullable(new VString(0, 100)),
    age: new VNullable(new VNumber(0, 200)),
    ...rawUserCommon,
  }),
  new VObject({
    type: new VEnum(["admin"] as const),
    ...rawUserCommon,
  }),
  new VObject({
    type: new VEnum(["helper"] as const),
    ...rawUserCommon,
  }),
]);

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
export const userSchema = new VPickUnion(rawUserSchema, [
  "id",
  "type",
  "username",
  "group",
  "age",
] as const); // .optional();

export const entities = <T>(entity: VSchema<T>) =>
  result(
    new VObject({
      entities: new VArray(entity),
      previousCursor: new VNullable(entity),
      nextCursor: new VNullable(entity),
    })
  );

const baseQuery = <T1, T2, T3>(
  s: VSchema<T1>,
  sorting: VSchema<T2>,
  filters: VSchema<T3>
) => {
  return {
    request: new VObject({
      paginationDirection: new VEnum(["forwards", "backwards"] as const),
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

export const createUserAction = VMergeUnion(
  new VPartialUnion(
    new VPickUnion(rawUserSchema, [
      "openid_id",
      "age",
      "away",
      "group",
      "type",
      "username",
      "deleted",
    ] as const),
    ["deleted", "group", "age", "away"] as const
  ),
  new VObject({
    password: new VUndefined(new VString(1)),
    action: new VEnum(["create"] as const),
  })
);

export const updateUserAction = VMergeUnion(
  new VPartialUnion(
    new VPickUnion(VMergeUnion(
      rawUserSchema,
       new VObject({
         password: new VUndefined(new VString(1)),
       })
     ), [
      "openid_id",
      "age",
      "away",
      "group",
      "type",
      "username",
      "project_leader_id",
      "force_in_project_id",
      "deleted",
    ] as const),
    [
      "openid_id",
      "age",
      "away",
      "group",
      "type",
      "username",
      "project_leader_id",
      "force_in_project_id",
      "deleted",
      "password",
    ] as const
  ),
  new VObject({
    id: new VNumber(),
    action: new VEnum(["update"] as const),
  })
);

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
      // this is our first nested discriminated union...
      // but we probably need to implmenet it
      new VDiscriminatedUnion("action", [createUserAction, updateUserAction])
    ),
    response: new VArray(
      new VPickUnion(rawUserSchema, [
        "id",
        "project_leader_id",
        "force_in_project_id",
      ] as const)
    ),
  },
  "/api/v1/projects/create": {
    request: new VPick(rawProjectSchema, [
      "costs",
      "deleted",
      "info",
      "max_age",
      "max_participants",
      "min_age",
      "min_participants",
      "place",
      "random_assignments",
      "title",
    ] as const),
    response: new VObject({ id: new VNumber() }),
  },
  "/api/v1/projects/update": {
    request: new VMerge(
      new VPartial(
        new VPick(rawProjectSchema, [
          "costs",
          "deleted",
          "info",
          "max_age",
          "max_participants",
          "min_age",
          "min_participants",
          "place",
          "random_assignments",
          "title",
        ] as const),
        [
          "costs",
          "deleted",
          "info",
          "max_age",
          "max_participants",
          "min_age",
          "min_participants",
          "place",
          "random_assignments",
          "title",
        ] as const
      ),
      new VObject({
        id: new VNumber(),
      })
    ),
    response: new VObject({ id: new VNumber() }),
  },
  "/api/v1/users": baseQuery(
    new VPartialUnion(
      new VPickUnion(rawUserSchema, [
        "id",
        "type",
        "username",
        "openid_id",
        "group",
        "age",
        "away",
        "project_leader_id",
        "force_in_project_id",
        "deleted",
      ] as const),
      ["openid_id", "force_in_project_id"] as const
    ),
    new VArray(
      new VDiscriminatedUnion(0, [
        new VTuple([
          new VEnum(["id"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["username"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["type"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["project_leader_id_eq"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNumber(),
        ]),
        new VTuple([
          new VEnum(["force_in_project_id_eq"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNumber(),
        ]),
      ])
    ),
    new VPartialUnion(
      new VPickUnion(rawUserSchema, [
        "id",
        "username",
        "type",
        "project_leader_id",
        "force_in_project_id",
        "deleted",
      ] as const),
      [
        "id",
        "username",
        "type",
        "project_leader_id",
        "force_in_project_id",
        "deleted",
      ] as const
    )
  ),
  "/api/v1/projects": baseQuery(
    new VPick(rawProjectSchema, [
      "id",
      "title",
      "info",
      "place",
      "costs",
      "min_age",
      "max_age",
      "min_participants",
      "max_participants",
      "random_assignments",
      "deleted",
    ] as const),
    new VArray(
      new VDiscriminatedUnion(0, [
        new VTuple([
          new VEnum(["id"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["title"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["info"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["project_leader_id_eq"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNumber(),
        ]),
        new VTuple([
          new VEnum(["force_in_project_id_eq"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNumber(),
        ]),
      ])
    ),
    new VPartial(
      new VPick(rawProjectSchema, ["id", "title", "info", "deleted"] as const),
      ["id", "title", "info", "deleted"] as const
    )
  ),
  "/api/v1/choices": baseQuery(
    new VMerge(
      rawChoiceNullable,
      new VPick(rawProjectSchema, [
        "id",
        "title",
        "info",
        "place",
        "costs",
        "min_age",
        "max_age",
        "min_participants",
        "max_participants",
        "random_assignments",
        "deleted",
      ] as const)
    ),
    new VArray(
      new VDiscriminatedUnion(0, [
        new VTuple([
          new VEnum(["id"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["title"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
        new VTuple([
          new VEnum(["rank"] as const),
          new VEnum(["ASC", "DESC"] as const),
          new VNullable(),
        ]),
      ])
    ),
    new VPartial(
      new VPick(new VMerge(rawChoiceNullable, rawProjectSchema), [
        "id",
        "title",
        "info",
        "rank",
      ] as const),
      ["id", "title", "info", "rank"] as const
    )
  ),
  "/api/v1/choices/update": {
    request: new VPick(rawChoiceNullable, ["project_id", "rank"] as const),
    response: z.object({}),
  },
  "/api/v1/sessions": baseQuery(
    rawSessionType,
    new VArray(
      new VTuple([
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
  | z.SafeParseSuccess<typeof routes[P]["response"]["schema"]>
  | MinimalSafeParseError;
