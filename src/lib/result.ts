// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { ZodError } from "zod";

export type OptionalResult<T, E extends { [key: string]: string } = { [key in keyof T]: string }> =
	| Result<T, E>
	| NoneResult<T, E>;

export type Result<T, E extends { [key: string]: string } = { [key in keyof T]: string }> =
	| SuccessResult<T, E>
	| FailureResult<T, E>;

export type NoneResult<T, E extends { [key: string]: string } = { [key in keyof T]: string }> = {
	result: 'none';
};

export type SuccessResult<T, E extends { [key: string]: string } = { [key in keyof T]: string }> = {
	result: 'success';
	success: T;
};

export type FailureResult<T, E extends { [key: string]: string } = { [key in keyof T]: string }> = {
	result: 'failure';
	failure: E;
};

export const isErr = <T, E extends { [key: string]: string } = { [key in keyof T]: string }>(
	result: OptionalResult<T, E>
): result is FailureResult<T, E> => {
	return result.result === 'failure';
};

export const isOk = <T, E extends { [key: string]: string } = { [key in keyof T]: string }>(
	result: OptionalResult<T, E>
): result is SuccessResult<T, E> => {
	return result.result === 'success';
};

export const ok = <T, E extends { [key: string]: string } = { [key in keyof T]: string }>(value: T): SuccessResult<T, E> => {
	return {
		result: 'success',
		success: value
	};
};

export const err = <T, E extends { [key: string]: string } = { [key in keyof T]: string }>(error: E): FailureResult<T, E> => {
	return {
		result: 'failure',
		failure: error
	};
};

export function andThen<T, E extends { [key: string]: string } = { [key in keyof T]: string }, U>(
	result: Result<T, E>,
	op: (v: T) => Result<U, E>
): Result<U, E> {
	if (!isOk(result)) {
		return result;
	}
	return op(result.success);
}

export function safeUnwrap<T, E extends { [key: string]: string } = { [key in keyof T]: string }>(result: SuccessResult<T, E>): T {
	return result.success;
}

export function unwrap<T, E extends { [key: string]: string } = { [key in keyof T]: string }>(
	result: OptionalResult<T, E>
): T {
	if (isOk(result)) {
		return result.success;
	}
	throw new Error("can't unwrap Err");
}

export function safeUnwrapErr<T, E extends { [key: string]: string } = { [key in keyof T]: string }>(
	result: FailureResult<T, E>
): E {
	return result.failure;
}

export function orDefault<T, E extends { [key: string]: string } = { [key in keyof T]: string }>(
	result: OptionalResult<T, E>,
	defaultResult: T
): T {
	if (isOk(result)) {
		return safeUnwrap(result);
	}
	return defaultResult;
}

export function mapOr<T, E extends { [key: string]: string } = { [key in keyof T]: string }, Q>(
	result: OptionalResult<T, E>,
	fun: (val: T) => Q,
	defaultResult: Q
): Q {
	if (isOk(result)) {
		return fun(safeUnwrap(result));
	}
	return defaultResult;
}

export function errOrDefault<T, E extends { [key: string]: string } = { [key in keyof T]: string }>(
	result: OptionalResult<T, E>,
	defaultError: E
): E {
	if (isErr(result)) {
		return safeUnwrapErr(result);
	}
	return defaultError;
}

export function zod2result<Input, Output>(input: {
	success: true;
	data: Output;
} | {
	success: false;
	error: ZodError<Input>;
}): Result<Output> {
	if (input.success) {
		return ok(input.data);
	} else {
		// @ts-expect-error
		return err(input.error.issues); // TODO FIXME
	}
}