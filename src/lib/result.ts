// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { z } from "zod";

export const successResult = <D extends import("zod").ZodTypeAny>(
  zodObject: D
): z.ZodObject<
  { success: z.ZodLiteral<true>; data: D },
  "strict",
  z.ZodTypeAny
> =>
  z
    .object({
      success: z.literal(true),
      data: zodObject,
    })
    .strict();

export const failureResult = <E extends import("zod").ZodTypeAny>(
  zodObject: E
): z.ZodObject<
  { success: z.ZodLiteral<false>; error: E },
  "strict",
  z.ZodTypeAny
> =>
  z
    .object({
      success: z.literal(false),
      error: zodObject,
    })
    .strict();

// TODO FIXME this creates bad error messages - switch on enum "result" value
export const result = <
  D extends import("zod").ZodTypeAny
>(
  successZodObject: D,
): z.ZodUnion<
  [
    z.ZodObject<
      { success: z.ZodLiteral<true>; data: D },
      "strict",
      z.ZodTypeAny
    >,
    z.ZodObject<
      { success: z.ZodLiteral<false>; error: E },
      "strict",
      z.ZodTypeAny
    >
  ]
> =>
  z.union([successResult(successZodObject), failureResult(z.record(z.string()))]);

export const anyResult = result(z.any());

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
