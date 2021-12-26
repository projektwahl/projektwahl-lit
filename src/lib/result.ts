// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { z } from "zod";

/**
 * @template {import("zod").ZodTypeAny} D
 * @param {D} zodObject
 * @returns {z.ZodObject<{ success: z.ZodLiteral<true>, data: D;}, "strict", z.ZodTypeAny>}
 */
export const successResult = (zodObject) =>
  z
    .object({
      success: z.literal(true),
      data: zodObject,
    })
    .strict();

/**
 * @template {import("zod").ZodTypeAny} E
 * @param {E} zodObject 
 * @returns {z.ZodObject<{ success: z.ZodLiteral<false>, error: E;}, "strict", z.ZodTypeAny>}
 */
export const failureResult = (zodObject) =>
  z
    .object({
      success: z.literal(false),
      error: zodObject,
    })
    .strict();

// TODO FIXME this creates bad error messages - switch on enum "result" value
/**
 * @template {import("zod").ZodTypeAny} D
 * @template {import("zod").ZodTypeAny} E
 * @param {D} successZodObject 
 * @param {E} failureZodObject 
 * @returns {z.ZodUnion<[z.ZodObject<{ success: z.ZodLiteral<true>, data: D;}, "strict", z.ZodTypeAny>, z.ZodObject<{ success: z.ZodLiteral<false>, error: E;}, "strict", z.ZodTypeAny>]>}
 */
export const result = (successZodObject, failureZodObject) => z.union([successResult(successZodObject), failureResult(failureZodObject)]);

export const anyResult = result(z.any(), z.any());

export const zod2result = /** 
  @template {z.ZodTypeAny} T
  @type <T extends z.ZodTypeAny>(schema: T, input: unknown) => z.infer<T> */ (schema, input) => {
  const result = schema.safeParse(input);
  if (result.success) {
    return input;
  } else {
    const flattenedErrors = result.error.flatten()

    /** @type {{[k: string]: string[];}} */
    const errors = {
      ...(flattenedErrors.formErrors.length == 0 ? {} : {formErrors: flattenedErrors.formErrors}),
      ...flattenedErrors.fieldErrors
    }
    const errors2 = /** @type {Partial<{ [key in keyof z.infer<T>]: string; }>} */ (Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v.join(". ")])))
    return {
      success: false,
      failure: errors2
    };
  }
}
