import { z, ZodType } from "zod";
import { result } from "./result.js";

// TODO FIXME make all of these strict so unknown properties create errors

export const loginInputSchema = z
  .object({
    username: z.string().min(3).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

// TODO FIXME
// https://github.com/colinhacks/zod#what-about-transforms
// the api should be typed with the input there

export const rawUserHelperOrAdminSchema = z.object({
  type: z.enum(["helper", "admin"]), // TODO FIXME
  username: z.string().min(3),
  away: z.string().refine(val => /^(on)|(off)$/, {message:"muss on/off sein"}).transform(v => v === "on"),
}).strict()

export const rawUserVoterSchema = z.object({
  type: z.enum(["voter"]), // TODO FIXME
  username: z.string().min(3),
  group: z.string().optional(),
  age: z.string().refine((val) => /^\d+$/.test(val), {message: "Keine Zahl"}).transform(Number).refine(val => val > 0 && val < 200, {message:"yeah genau so alt biste - das kannste mir nicht erzählen"}).optional(),
  away: z.string().refine(val => /^(on)|(off)$/, {message:"muss on/off sein"}).transform(v => v === "on"),
}).strict()

export const rawUserSchema = rawUserHelperOrAdminSchema.or(rawUserVoterSchema)

export const withId = (/** @type {ZodType<any>} */ schema) => schema.or(z.object({
    id: z.number(),
}))

/*.refine(v => {
  v.type !== "voter" || (v.group !== null && v.age !== null)
}, {
  message: "Ein Schüler muss einer Klasse und einem Jahrgang zugewiesen sein",
  path: ["type"]
});*/

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
    response: result(z.null(), z.record(z.string())),
  },
  "/api/v1/users": {
    request: z.undefined(),
    response: z.array(withId(rawUserSchema)),
  },
});
