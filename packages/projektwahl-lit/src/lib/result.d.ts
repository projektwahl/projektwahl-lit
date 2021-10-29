import { ZodError } from "zod";
export declare type OptionalResult<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}> = Result<T, E> | NoneResult<T, E>;
export declare type Result<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}> = SuccessResult<T, E> | FailureResult<T, E>;
export declare type NoneResult<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}> = {
    result: "none";
};
export declare type SuccessResult<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}> = {
    result: "success";
    success: T;
};
export declare type FailureResult<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}> = {
    result: "failure";
    failure: E;
};
export declare const isErr: <T, E extends {
    [key: string]: string;
} = { [key in keyof T]: string; }>(result: OptionalResult<T, E>) => result is FailureResult<T, E>;
export declare const isOk: <T, E extends {
    [key: string]: string;
} = { [key in keyof T]: string; }>(result: OptionalResult<T, E>) => result is SuccessResult<T, E>;
export declare const ok: <T, E extends {
    [key: string]: string;
} = { [key in keyof T]: string; }>(value: T) => SuccessResult<T, E>;
export declare const err: <T, E extends {
    [key: string]: string;
} = { [key in keyof T]: string; }>(error: E) => FailureResult<T, E>;
export declare function andThen<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}, U>(result: Result<T, E>, op: (v: T) => Result<U, E>): Result<U, E>;
export declare function safeUnwrap<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}>(result: SuccessResult<T, E>): T;
export declare function unwrap<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}>(result: OptionalResult<T, E>): T;
export declare function safeUnwrapErr<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}>(result: FailureResult<T, E>): E;
export declare function orDefault<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}>(result: OptionalResult<T, E>, defaultResult: T): T;
export declare function mapOr<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}, Q>(result: OptionalResult<T, E>, fun: (val: T) => Q, defaultResult: Q): Q;
export declare function errOrDefault<T, E extends {
    [key: string]: string;
} = {
    [key in keyof T]: string;
}>(result: OptionalResult<T, E>, defaultError: E): E;
export declare function zod2result<Input, Output>(input: {
    success: true;
    data: Output;
} | {
    success: false;
    error: ZodError<Input>;
}): Result<Output>;
