import { AnyZodObject, objectUtil, z, ZodNumber, ZodObject, ZodRawShape, ZodType, ZodTypeAny, ZodTypeDef } from "zod";
import { result } from "./result.js";

export const loginInputSchema = z
  .object({
    username: z.string().min(4).max(100),
    password: z.string().min(6).max(1024),
  })
  .strict();

const rawUserCommon = {
  id: z.number().nullable(),
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
    group: z.null(),
    age: z.null(),
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

export const rawUserSchema = <O1, D1 extends ZodTypeDef = ZodTypeDef, I1 = O1, O2, D2 extends ZodTypeDef = ZodTypeDef, I2 = O2>(v1: ZodType<O1, D1, I1>, v2: ZodType<O2, D2, I2>) => z.object({
  type: z.enum(["helper", "admin", "voter"])
}).passthrough().superRefine((value, ctx) => {
  // KEEP this line synchronized with the one below
  let schema = value.type === "voter" ? v1 : v2;
  let parsed = schema.safeParse(value)
  if (!parsed.success) {
    parsed.error.issues.forEach(ctx.addIssue)
  }
}).transform(value => {
    // KEEP this line synchronized with the one above
    let schema = value.type === "voter" ? v1 : v2;
    return schema.parse(value);
})

export const makeCreateOrUpdate = <T extends { [k: string]: ZodTypeAny;}, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends ZodTypeAny = ZodTypeAny>(s: ZodObject<T, UnknownKeys, Catchall>) => z.object({
  id: z.number().optional()
}).passthrough().superRefine((value, ctx) => {
  // KEEP this line synchronized with the one below
  let schema = value.id ? s.partial().setKey("id", z.number()) : s.setKey("id", z.null());
  let parsed = schema.safeParse(value)
  if (!parsed.success) {
    parsed.error.issues.forEach(ctx.addIssue)
  }
}).transform(value => {
  // KEEP this line synchronized with the one above
  let schema = value.id ? s.partial().setKey("id", z.number()) : s.setKey("id", z.null());
  return schema.parse(value);
})

export const rawProjectSchema = z.object({
  id: z.number().nullable(),
  title: z.string().max(1024),
  info: z.string().max(8192),
  place: z.string().max(1024),
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

function identity<T extends { [r in keys]: { request: ZodType<any>, response: ZodType<any> } }>(v: T) {
  return v;
}

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

const usersCreateOrUpdate = <T extends { [k: string]: ZodTypeAny;}, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends ZodTypeAny = ZodTypeAny>(s: ZodObject<T, UnknownKeys, Catchall>) => makeCreateOrUpdate(s.pick({
  age: true,
  away: true,
  group: true,
  id: true,
  type: true,
  username: true
}).extend({
  password: z.string().optional()
}))

const jo = usersCreateOrUpdate(rawUserVoterSchema)
let a: z.infer<typeof jo>;

const jo2 = usersCreateOrUpdate(rawUserHelperOrAdminSchema)
let a2: z.infer<typeof jo2>;


//console.log(rawUserHelperOrAdminSchema.safeParse({}))
// TODO FIXME report upstream (picking missing keys breaks)
//console.log(usersCreateOrUpdate(rawUserHelperOrAdminSchema).safeParse({}))

const users = <T extends { [k: string]: ZodTypeAny;}, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends ZodTypeAny = ZodTypeAny>(s: ZodObject<T, UnknownKeys, Catchall>) => s.pick({
  id: true,
  type: true,
  username: true,
  group: true,
  age: true,
  away: true
})

const project = rawProjectSchema.pick({
  "id": true,
  "title": true,
  "info": true,
  "place": true,
  "costs": true,
  "min_age": true,
  "max_age": true,
  "min_participants": true,
  "max_participants": true,
  "random_assignments": true
})

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
    request: rawUserSchema(usersCreateOrUpdate(rawUserVoterSchema), usersCreateOrUpdate(rawUserHelperOrAdminSchema)),
    response: result(z.object({}).extend({ id: z.number() }), z.record(z.string())),
  },
  "/api/v1/projects/create-or-update": {
    request: makeCreateOrUpdate(rawProjectSchema),
    response: result(z.object({}).extend({ id: z.number() }), z.record(z.string())),
  },
  "/api/v1/users": {
    request: z.undefined(),
    response: z.object({
      entities: z.array(rawUserSchema(users(rawUserVoterSchema), users(rawUserHelperOrAdminSchema))),
      previousCursor: rawUserSchema(users(rawUserVoterSchema), users(rawUserHelperOrAdminSchema)).nullable(),
      nextCursor: rawUserSchema(users(rawUserVoterSchema), users(rawUserHelperOrAdminSchema)).nullable(),
    })
  },
  "/api/v1/projects": {
    request: z.undefined(),
    response: z.object({
      entities: z.array(project),
      previousCursor: project.nullable(),
      nextCursor: project.nullable(),
    })
  },
} as const);

//const test: z.infer<typeof routes["/api/v1/projects/create-or-update"]["request"]> = 1 as any;
