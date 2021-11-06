import { z, ZodType } from "zod";
import { result } from "./result.js";

export const loginInputSchema = z.object({
    username: z.string().min(3).max(100),
    password: z.string().min(6).max(1024),
}).strict();

export const loginOutputSchema = result(z.void(), z.record(z.string()))

/** @type {{ [regex: string]: { request: ZodType<any, any, any>, response: ZodType<any, any, any> } }} */
export const routes = {
    "/api/v1/login": {
        request: loginInputSchema,
        response: loginOutputSchema,
    }
}