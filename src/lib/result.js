// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { z } from "zod";

export const noneResult = z
  .object({
    result: z.enum(["none"]),
  })
  .strict();

export const successResult = (/** @type {ZodType<any>} */ zodObject) =>
  z
    .object({
      result: z.enum(["success"]),
      success: zodObject,
    })
    .strict();

export const failureResult = (/** @type {ZodRecord<any>} */ zodObject) =>
  z
    .object({
      result: z.enum(["failure"]),
      failure: zodObject,
    })
    .strict();

// TODO FIXME this creates bad error messages - switch on enum "result" value
export const result = (
  /** @type {ZodType<any>} */ successZodObject,
  /** @type {ZodRecord<any>} */ failureZodObject
) => successResult(successZodObject).or(failureResult(failureZodObject));

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").OptionalResult<T, E>) => result is import("../lib/types.js").FailureResult<T, E>} */
export const isErr = (result) => {
  return result.result === "failure";
};

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").OptionalResult<T, E>) => result is import("../lib/types.js").SuccessResult<T, E>} */
export const isOk = (result) => {
  return result.result === "success";
};

/**
 * @template Output 
 * @template Input
 * @param input {{
        success: true;
        data: Output;
      }
    | {
        success: false;
        error: import("zod").ZodError<Input>;
      }}
 * @returns {{
        success: true;
        result: Output;
      }
    | {
        success: false;
        failure: Partial<{ [key in keyof Output]: string; }>;
      }}
 */
export function zod2result(input) {
  if (input.success) {
    return {
      success: true,
      result: input.data // TODO FIXME return our own result type to data and error instead of result and failure to match this.
    };
  } else {
    const flattenedErrors = input.error.flatten()

    /** @type {{[k: string]: string[];}} */
    const errors = {
      ...(flattenedErrors.formErrors.length == 0 ? {} : {formErrors: flattenedErrors.formErrors}),
      ...flattenedErrors.fieldErrors
    }
    const errors2 = /** @type {Partial<{ [key in keyof Output]: string; }>} */ (Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v.join(". ")])))
    return {
      success: false,
      failure: errors2
    };
  }
}
