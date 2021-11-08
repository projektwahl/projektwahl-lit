import { z, ZodType } from "zod";
import { result } from "./result.js";

export const loginInputSchema = z
  .object({
    username: z.string().min(3).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

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
});
