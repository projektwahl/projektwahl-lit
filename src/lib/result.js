// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { z, ZodRecord, ZodType } from "zod";

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

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(value: T) => import("../lib/types.js").SuccessResult<T, E>} */
export const ok = (value) => {
  return {
    result: "success",
    success: value,
  };
};

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(error: E) => import("../lib/types.js").FailureResult<T, E>} */
export const err = (error) => {
  return {
    result: "failure",
    failure: error,
  };
};

/** @type {<U,T,E extends { [key: string]: string } = { [key in keyof T]: string },>(result: import("../lib/types.js").Result<T, E>, op: (v: T) => import("../lib/types.js").Result<U, E>) => import("../lib/types.js").Result<U, E>} */
export function andThen(result, op) {
  if (!isOk(result)) {
    return result;
  }
  return op(result.success);
}

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").SuccessResult<T, E>) => T} */
export function safeUnwrap(result) {
  return result.success;
}

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").OptionalResult<T, E>) => T} */
export function unwrap(result) {
  if (isOk(result)) {
    return result.success;
  }
  throw new Error("can't unwrap Err");
}

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").FailureResult<T, E>) => E} */
export function safeUnwrapErr(result) {
  return result.failure;
}

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").OptionalResult<T, E>, defaultResult: T) => T} */
export function orDefault(result, defaultResult) {
  if (isOk(result)) {
    return safeUnwrap(result);
  }
  return defaultResult;
}

/** @type {<Q,T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").OptionalResult<T, E>, fun: (val: T) => Q, defaultResult: Q) => Q} */
export function mapOr(result, fun, defaultResult) {
  if (isOk(result)) {
    return fun(safeUnwrap(result));
  }
  return defaultResult;
}

/** @type {<T,E extends { [key: string]: string } = { [key in keyof T]: string }>(result: import("../lib/types.js").OptionalResult<T, E>, defaultError: E) => E} */
export function errOrDefault(result, defaultError) {
  if (isErr(result)) {
    return safeUnwrapErr(result);
  }
  return defaultError;
}

const zoderr2err = (/** @type {import("zod").z.ZodIssue[]} */ arr) => {
  const initialValue = {};
  // @ts-expect-error this is hard to type
  return arr.reduce((/** @type {Record<string, string>} */ acc, cval) => {
    const myAttribute = cval.path[0];
    acc[myAttribute] = (acc[myAttribute] || "") + cval.message + ". ";
    return acc;
  }, initialValue);
};

/** @type {<Input, Output>(input:
    | {
        success: true;
        data: Output;
      }
    | {
        success: false;
        error: import("zod").ZodError<Input>;
      }
) => import("../lib/types").Result<Output>} */
export function zod2result(input) {
  if (input.success) {
    return ok(input.data);
  } else {
    // @ts-expect-error this is hard to type
    return err(zoderr2err(input.error.issues)); // TODO FIXME
  }
}
