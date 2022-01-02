// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { SomeZodObject, z, ZodObject, ZodType, ZodTypeAny, ZodTypeDef } from "zod";
import type { UnknownKeysParam } from "./routes.js";

export const successResult = <T extends SomeZodObject>(s: T) => z
    .object({
      success: z.literal(true),
      data: s,
    })
    .strict();

export const failureResult = <Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(s: ZodType<Output, Def, Input>) => z
    .object({
      success: z.literal(false),
      error: s,
    })
    .strict();

export const result = <T extends { [k: string]: ZodTypeAny }, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends ZodTypeAny = ZodTypeAny>(s: ZodObject<T, UnknownKeys, Catchall>) => z.union([successResult(s), failureResult(z.record(z.string()))]);

export const zod2result = <T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): z.infer<T> => {
  const result = schema.safeParse(input);
  if (result.success) {
    return result;
  } else {
    const flattenedErrors = result.error.flatten();
    console.log(result.error);

    /** @type {{[k: string]: string[];}} */
    const errors: { [k: string]: string[] } = {
      ...(flattenedErrors.formErrors.length == 0
        ? {}
        : { formErrors: flattenedErrors.formErrors }),
      ...flattenedErrors.fieldErrors,
    };
    const errors2 =
      /** @type {Partial<{ [key in keyof z.infer<T>]: string; }>} */ Object.fromEntries(
        Object.entries(errors).map(([k, v]) => [k, v.join(". ")])
      );
    return {
      success: false,
      error: errors2,
    };
  }
};
