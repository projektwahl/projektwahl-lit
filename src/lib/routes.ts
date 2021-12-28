import { z, ZodNumber } from "zod";
import { result } from "./result.js";

export const loginInputSchema = z
  .object({
    username: z.string().min(4).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

const rawUserCommon = {
  id: z.number(),
  username: z.string().min(3).max(100),
  openid_id: z.string().optional(),
  password_hash: z.string(),
  password_salt: z.string(),
  away: z.boolean(),
  project_leader_id: z.number(),
  password_changed: z.boolean(),
  force_in_project_id: z.number(),
  computed_in_project_id: z.number(),
}

export const rawUserHelperOrAdminSchema = z
  .object({
    type: z.enum(["helper", "admin"]),
    ...rawUserCommon
  })
  .strict();

export const rawUserVoterSchema = z
  .object({
    type: z.enum(["voter"]),
    group: z.string().min(1).max(100),
    age: z.number().min(0).max(200),
    ...rawUserCommon
  })
  .strict();

export const rawUserSchema = z.union([rawUserVoterSchema, rawUserHelperOrAdminSchema])

export const rawProjectSchema = z.object({
  id: z.number(),
  title: z.string().min(3).max(1024),
  info: z.string().min(1).max(8192),
  place: z.string().min(1).max(1024),
  costs: z.number().min(0).max(100),
  min_age: z.number().min(0).max(200),
  max_age: z.number().min(0).max(200),
  min_participants: z.number().min(1).max(1000),
  max_participants: z.number().min(1).max(1000),
  random_assignments: z.boolean(),
}).strict();

export const rawSessionType = z.object({
  session_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  user_id: z.number(),
});

export const loginOutputSchema = result(z.null(), z.record(z.string()));

export type keys = "/api/v1/login"|"/api/v1/openid-login"|"/api/v1/redirect"|"/api/v1/sleep"|"/api/v1/update"|"/api/v1/users/create-or-update"|"/api/v1/projects/create-or-update"|"/api/v1/users"|"/api/v1/projects";

function identity<T extends { [r in keys]: { request: import("zod").ZodType<any>, response: import("zod").ZodType<any> } }>(v: T) {
  return v;
}

export const routes = identity({
  "/api/v1/login": {
    request: loginInputSchema,
    response: loginOutputSchema,
  },
  "/api/v1/openid-login": {
    request: z.any(),
    response: z.any(),
  },
  "/api/v1/redirect": {
    request: z.any(),
    response: z.any(),
  },
  "/api/v1/sleep": {
    request: z.undefined(),
    response: z.undefined(),
  },
  "/api/v1/update": {
    request: z.undefined(),
    response: z.number(),
  },
  "/api/v1/users/create-or-update": {
    request: z.union([rawUserVoterSchema.extend({ id: z.number().optional(), password: z.string().optional() }), rawUserHelperOrAdminSchema.extend({ id: z.number().optional(), password: z.string().optional() })]),
    response: result(z.object({}).extend({ id: z.number() }), z.record(z.string())),
  },
  "/api/v1/projects/create-or-update": {
    request: rawProjectSchema.extend({ id: z.number().optional() }),
    response: result(z.object({}).extend({ id: z.number() }), z.record(z.string())),
  },
  "/api/v1/users": {
    request: z.undefined(),
    response: z.array(z.union([rawUserVoterSchema.pick({
      id: true,
      type: true,
      username: true
    }).strict(), rawUserHelperOrAdminSchema.pick({
      id: true,
      type: true,
      username: true
    }).strict()])),
  },
  "/api/v1/projects": {
    request: z.undefined(),
    response: z.array(rawProjectSchema.extend({ id: z.number() })),
  },
} as const);
