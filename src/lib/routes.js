import { z, ZodType } from "zod";
import { result } from "./result.js";

export const loginInputSchema = z
  .object({
    username: z.string().min(3).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

// TODO FIXME
// https://github.com/colinhacks/zod#what-about-transforms
// the api should be typed with the input there

export const rawUserSchema = z.object({
  id: z.number(),
  type: z.string(), // TODO FIXME
  name: z.string(),
  password: z.string(),
  group: z.string(),
  age: z.string().refine((val) => /^\d+$/.test(val)).transform(Number).refine(val => val > 0 && val < 200, {message:"yeah genau so alt biste - das kannste mir nicht erzählen"}),
  away: z.boolean(),
});

export const loginOutputSchema = result(z.void(), z.record(z.string()));

/* @type {{ [r in "/api/v1/login"|"/api/v1/sleep"]: { request: ZodType<any>, response: ZodType<any> } }} */
export const routes = /** @type {const} */ ({
  "/api/v1/login": {
    request: loginInputSchema,
    response: loginOutputSchema,
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
    response: z.undefined(),
  },
  "/api/v1/users": {
    request: z.undefined(),
    response: z.array(rawUserSchema),
  },
});
