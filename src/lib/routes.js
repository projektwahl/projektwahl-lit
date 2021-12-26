import { z } from "zod";
import { result } from "./result.js";

export const loginInputSchema = z
  .object({
    username: z.string().min(4).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

export const rawUserHelperOrAdminSchema = z
  .object({
    type: z.enum(["helper", "admin"]),
    username: z.string().min(3).max(100),
    away: z.boolean(),
  })
  .strict();

export const rawUserVoterSchema = z
  .object({
    type: z.enum(["voter"]),
    username: z.string().min(3).max(100),
    group: z.string().min(1).max(100),
    age: z.number().min(0).max(200),
    away: z.boolean(),
  })
  .strict();

export const rawUserSchema = z.object({
  type: z.enum(["helper", "admin", "voter"])
}).passthrough().superRefine((value, ctx) => {
  let schema = value.type === "voter" ? rawUserVoterSchema : rawUserHelperOrAdminSchema;
  let parsed = schema.safeParse(value)
  if (!parsed.success) {
    parsed.error.issues.forEach(ctx.addIssue)
  }
}).transform(value => {
  let schema = value.type === "voter" ? rawUserVoterSchema : rawUserHelperOrAdminSchema;
  return schema.parse(value)
})

export const rawProjectSchema = z.object({
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

export const withId = (/** @type {import("zod").ZodType<any>} */ schema) =>
  schema.or(
    z
      .object({
        id: z.number(),
      })
  );

export const loginOutputSchema = result(z.void(), z.record(z.string()));

/** @typedef {"/api/v1/login"|"/api/v1/openid-login"|"/api/v1/redirect"|"/api/v1/sleep"|"/api/v1/update"|"/api/v1/users/create"|"/api/v1/projects/create"|"/api/v1/users"|"/api/v1/projects"} keys */

/** @type {{ [r in keys]: { request: import("zod").ZodType<any>, response: import("zod").ZodType<any> } }} */
export const routes = /** @type {const} */ ({
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
  "/api/v1/users/create": {
    request: rawUserSchema,
    response: result(withId(z.object({})), z.record(z.string())),
  },
  "/api/v1/projects/create": {
    request: rawProjectSchema,
    response: result(withId(z.object({})), z.record(z.string())),
  },
  "/api/v1/users": {
    request: z.undefined(),
    response: z.array(withId(rawUserSchema)),
  },
  "/api/v1/projects": {
    request: z.undefined(),
    response: z.array(withId(rawProjectSchema)),
  },
});
