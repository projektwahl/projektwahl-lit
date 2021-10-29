// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
export const isErr = (result) => {
    return result.result === "failure";
};
export const isOk = (result) => {
    return result.result === "success";
};
export const ok = (value) => {
    return {
        result: "success",
        success: value,
    };
};
export const err = (error) => {
    return {
        result: "failure",
        failure: error,
    };
};
export function andThen(result, op) {
    if (!isOk(result)) {
        return result;
    }
    return op(result.success);
}
export function safeUnwrap(result) {
    return result.success;
}
export function unwrap(result) {
    if (isOk(result)) {
        return result.success;
    }
    throw new Error("can't unwrap Err");
}
export function safeUnwrapErr(result) {
    return result.failure;
}
export function orDefault(result, defaultResult) {
    if (isOk(result)) {
        return safeUnwrap(result);
    }
    return defaultResult;
}
export function mapOr(result, fun, defaultResult) {
    if (isOk(result)) {
        return fun(safeUnwrap(result));
    }
    return defaultResult;
}
export function errOrDefault(result, defaultError) {
    if (isErr(result)) {
        return safeUnwrapErr(result);
    }
    return defaultError;
}
const zoderr2err = (arr) => {
    const initialValue = {};
    return arr.reduce((acc, cval) => {
        const myAttribute = cval.path[0];
        acc[myAttribute] = (acc[myAttribute] || "") + cval.message + ". ";
        return acc;
    }, initialValue);
};
export function zod2result(input) {
    if (input.success) {
        return ok(input.data);
    }
    else {
        // @ts-expect-error
        return err(zoderr2err(input.error.issues)); // TODO FIXME
    }
}
