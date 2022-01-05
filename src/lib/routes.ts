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
import {
  AnyZodObject,
  objectUtil,
  z,
  ZodNumber,
  ZodObject,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
} from "zod";
import { result } from "./result.js";

export const loginInputSchema = z
  .object({
    username: z.string().min(3).max(100),
    password: z.string(),
  })
  .strict();

if (!globalThis.Buffer) {
  // @ts-expect-error hack for client
  globalThis.Buffer = ArrayBuffer;
}

const rawUserCommon = {
  id: z.number(),
  username: z.string().min(3).max(100),
  openid_id: z.string().optional(),
  password_hash: z.string(),
  away: z.boolean(),
  project_leader_id: z.number().nullable(),
  password_changed: z.boolean(),
  force_in_project_id: z.number().nullable(),
  computed_in_project_id: z.number().nullable(),
  deleted: z.boolean(),
};

export const rawUserHelperOrAdminSchema = z
  .object({
    type: z.enum(["helper", "admin"]),
    group: z.string().nullable(), // TODO FIXME add validation inside database that these are null as this depends on the type value and the previous type value
    age: z.number().nullable(),
    ...rawUserCommon,
  })
  .strict();

export const rawUserVoterSchema = z
  .object({
    type: z.enum(["voter"]),
    group: z.string().min(1).max(100),
    age: z.number().min(0).max(200),
    ...rawUserCommon,
  })
  .strict();

export const rawUserSchema = <
  O1,
  O2,
  D1 extends ZodTypeDef = ZodTypeDef,
  D2 extends ZodTypeDef = ZodTypeDef,
  I1 = O1,
  I2 = O2
>(
  v1: ZodType<O1, D1, I1>,
  v2: ZodType<O2, D2, I2>
) =>
  z
    .object({
      type: z.enum(["helper", "admin", "voter"]).optional(),
    })
    .passthrough()
    .superRefine((value, ctx) => {
      // KEEP this line synchronized with the one below
      let schema = value.type === "voter" ? v1 : v2;
      let parsed = schema.safeParse(value);
      if (!parsed.success) {
        parsed.error.issues.forEach(ctx.addIssue);
      }
    })
    .transform((value) => {
      // KEEP this line synchronized with the one above
      let schema = value.type === "voter" ? v1 : v2;
      return schema.parse(value);
    });

export const makeCreateOrUpdate = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  z
    .object({
      id: z.number().nullable(),
    })
    .passthrough()
    .superRefine((value, ctx) => {
      // KEEP this line synchronized with the one below
      let schema = value.id
        ? s.partial().setKey("id", z.number())
        : s.extend({
            id: z.null(),
          });
      let parsed = schema.safeParse(value);
      if (!parsed.success) {
        parsed.error.issues.forEach(ctx.addIssue);
      }
    })
    .transform((value) => {
      // KEEP this line synchronized with the one above
      let schema = value.id
        ? s.partial().setKey("id", z.number())
        : s.extend({
            id: z.null(),
          });
      return schema.parse(value);
    });

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
  })
  .strict();

export const rawSessionType = z.object({
  session_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  user_id: z.number(),
});

export const loginOutputSchema = result(z.object({}));

export type keys =
  | "/api/v1/login"
  | "/api/v1/logout"
  | "/api/v1/openid-login"
  | "/api/v1/redirect"
  | "/api/v1/sleep"
  | "/api/v1/update"
  | "/api/v1/users/create-or-update"
  | "/api/v1/projects/create-or-update"
  | "/api/v1/users"
  | "/api/v1/projects";

function identity<
  T extends {
    [r in keys]: {
      request: z.ZodTypeAny;
      response: z.ZodUnion<
        [
          z.ZodObject<
            { success: z.ZodLiteral<true>; data: z.ZodTypeAny },
            "strict",
            z.ZodTypeAny
          >,
          z.ZodObject<
            { success: z.ZodLiteral<false>; error: z.ZodTypeAny },
            "strict",
            z.ZodTypeAny
          >
        ]
      >;
    };
  }
>(v: T) {
  return v;
}

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

const usersCreateOrUpdate = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  makeCreateOrUpdate(
    s
      .pick({
        age: true,
        away: true,
        group: true,
        id: true,
        type: true,
        username: true,
        project_leader_id: true,
        force_in_project_id: true,
        deleted: true,
      })
      .extend({
        password: z.string(),
      })
  );

/*
const jo = usersCreateOrUpdate(rawUserVoterSchema)
let a: z.infer<typeof jo>;

const jo2 = usersCreateOrUpdate(rawUserHelperOrAdminSchema)
let a2: z.infer<typeof jo2>;
*/

//console.log(rawUserHelperOrAdminSchema.safeParse({}))
// TODO FIXME report upstream (picking missing keys breaks)
//console.log(usersCreateOrUpdate(rawUserHelperOrAdminSchema).safeParse({}))

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

let a = entities(z.object({}));

let b: z.infer<typeof a>;

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
    // deleted: true
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
});

// make every route a result?
export const routes = identity({
  "/api/v1/logout": {
    request: z.any(),
    response: result(z.object({})),
  },
  "/api/v1/login": {
    request: loginInputSchema,
    response: loginOutputSchema,
  },
  "/api/v1/openid-login": {
    request: z.any(),
    response: result(z.object({})),
  },
  "/api/v1/redirect": {
    request: z.any(),
    response: result(z.object({})),
  },
  "/api/v1/sleep": {
    request: z.undefined(),
    response: result(z.object({})),
  },
  "/api/v1/update": {
    request: z.undefined(),
    response: result(z.object({})),
  },
  "/api/v1/users/create-or-update": {
    request: rawUserSchema(
      usersCreateOrUpdate(rawUserVoterSchema),
      usersCreateOrUpdate(rawUserHelperOrAdminSchema)
    ),
    response: result(
      rawUserSchema(
        createOrUpdateUserResponse(rawUserVoterSchema),
        createOrUpdateUserResponse(rawUserHelperOrAdminSchema)
      )
    ),
  },
  "/api/v1/projects/create-or-update": {
    request: makeCreateOrUpdate(rawProjectSchema),
    response: result(z.object({}).extend({ id: z.number() })),
  },
  "/api/v1/users": {
    request: z.undefined(),
    response: result(
      z.object({
        entities: z.array(
          rawUserSchema(
            users(rawUserVoterSchema),
            users(rawUserHelperOrAdminSchema)
          )
        ),
        previousCursor: rawUserSchema(
          users(rawUserVoterSchema),
          users(rawUserHelperOrAdminSchema)
        ).nullable(),
        nextCursor: rawUserSchema(
          users(rawUserVoterSchema),
          users(rawUserHelperOrAdminSchema)
        ).nullable(),
      })
    ),
  },
  "/api/v1/projects": {
    request: z.undefined(),
    response: result(
      z.object({
        entities: z.array(project),
        previousCursor: project.nullable(),
        nextCursor: project.nullable(),
      })
    ),
  },
} as const);

export const entityRoutes = {
  "/api/v1/users": routes["/api/v1/users"],
  "/api/v1/projects": routes["/api/v1/projects"],
};

//const test: z.infer<typeof routes["/api/v1/projects/create-or-update"]["request"]> = 1 as any;
