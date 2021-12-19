import { z } from "zod";
import { result } from "./result.js";

// TODO FIXME make all of these strict so unknown properties create errors

export const loginInputSchema = z
  .object({
    username: z.string().min(3).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

export const rawUserHelperOrAdminSchema = z
  .object({
    type: z.enum(["helper", "admin"]),
    username: z.string().min(3),
    away: z.boolean(),
  })
  .strict();

export const rawUserVoterSchema = z
  .object({
    type: z.enum(["voter"]),
    username: z.string().min(3),
    group: z.string().optional(),
    age: z.number()
      .refine((val) => val > 0 && val < 200, {
        message: "yeah genau so alt biste - das kannste mir nicht erzählen",
      }),
    away: z.boolean(),
  })
  .strict();

export const rawUserSchema = rawUserHelperOrAdminSchema.or(rawUserVoterSchema);

export const rawProjectSchema = z.object({
  title: z.string(),
  info: z.string(),
  place: z.string(),
  costs: z.number(),
  min_age: z.number(),
  max_age: z.number(),
  min_participants: z.number(),
  max_participants: z.number(),
  random_assignments: z.boolean(),
});

export const withId = (/** @type {import("zod").ZodType<any>} */ schema) =>
  schema.or(
    z.object({
      id: z.number(),
    })
  );

export const loginOutputSchema = result(z.void(), z.record(z.string()));

/* @type {{ [r in "/api/v1/login"|"/api/v1/sleep"]: { request: ZodType<any>, response: ZodType<any> } }} */
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
});
