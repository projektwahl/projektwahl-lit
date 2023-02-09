/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { z, ZodObject, ZodType } from "zod";
import type { entityRoutes, UnknownKeysParam } from "./routes.js";
export declare const successResult: <T extends {
    [k: string]: z.ZodTypeAny;
}, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends z.ZodTypeAny = z.ZodTypeAny>(s: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>) => z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>;
}, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>;
}> extends infer T_1 extends object ? { [k in keyof T_1]: z.baseObjectOutputType<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>;
}>[k]; } : never, z.objectUtil.addQuestionMarks<{
    success: true;
    data: z.objectInputType<T, Catchall>;
}> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
    success: true;
    data: z.objectInputType<T, Catchall>;
}>[k_1]; } : never>;
export declare const failureResult: <Output, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = Output>(s: z.ZodType<Output, Def, Input>) => z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodType<Output, Def, Input>;
}, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
    success: z.ZodLiteral<false>;
    error: z.ZodType<Output, Def, Input>;
}> extends infer T extends object ? { [k in keyof T]: z.baseObjectOutputType<{
    success: z.ZodLiteral<false>;
    error: z.ZodType<Output, Def, Input>;
}>[k]; } : never, z.objectUtil.addQuestionMarks<{
    success: false;
    error: Input;
}> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
    success: false;
    error: Input;
}>[k_1]; } : never>;
export declare const result: <T extends {
    [k: string]: z.ZodTypeAny;
}, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends z.ZodTypeAny = z.ZodTypeAny>(s: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>) => z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>;
}, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>;
}> extends infer T_1 extends object ? { [k in keyof T_1]: z.baseObjectOutputType<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>;
}>[k]; } : never, z.objectUtil.addQuestionMarks<{
    success: true;
    data: z.objectInputType<T, Catchall>;
}> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
    success: true;
    data: z.objectInputType<T, Catchall>;
}>[k_1]; } : never>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodType<Record<string, string>, z.ZodRecordDef<z.ZodString, z.ZodString>, Record<string, string>>;
}, "strict", z.ZodTypeAny, {
    error: Record<string, string>;
    success: false;
}, {
    error: Record<string, string>;
    success: false;
}>]>;
export type ToIndexed<T extends {
    [K: string]: {
        [inner in I]: unknown;
    };
}, I extends string | number | symbol> = {
    [K in keyof T]: T[K][I];
};
export declare function mappedIndexing<T extends {
    [K: string]: {
        [inner in I]: unknown;
    };
}, K extends string, I extends string | number | symbol>(value: T[K], index: I): ToIndexed<T, I>[K];
export declare function mappedIndexingSet<T extends {
    [K: string]: {
        [inner in I]: unknown;
    };
}, K extends string, I extends string | number | symbol>(value: T[K], index: I, newValue: ToIndexed<T, I>[K]): void;
export type ToTuple<K extends string | symbol | number, T extends {
    [key in K]: unknown;
}, Q extends {
    [key in K]: unknown;
}, R extends {
    [key in K]: unknown;
}> = {
    [key in K]: [T[key], Q[key], R[key]];
};
export declare function mappedTuple<K extends string | number | symbol, T extends {
    [key in K]: unknown;
}, Q extends {
    [key in K]: unknown;
}, R extends {
    [key in K]: unknown;
}>(path: K, value1: T[K], value2: Q[K], value3: R[K]): ToTuple<K, T, Q, R>[K];
export declare function testa<Output>(zodtype: ZodType<Output>, data: unknown): Output;
export type MappedFunctionCallType<T extends {
    [K: string]: ZodType<unknown>;
}> = {
    [K in keyof T]: T[K]["_output"];
};
export declare function mappedFunctionCall<T extends {
    [K: string]: ZodType<unknown>;
}, K extends string>(schema: T[K], value: unknown): MappedFunctionCallType<T>[K];
type entitiesType15 = {
    [K in keyof typeof entityRoutes]: Array<entitiesType4[K]>;
};
type entitiesType4 = {
    [K in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[K]["request"]>["sorting"][number];
};
export declare function mappedFunctionCall2<R extends keyof typeof entityRoutes, U>(array: entitiesType15[R], functio: (v: entitiesType4[R]) => ReadonlyArray<U>): Array<U>;
export {};
