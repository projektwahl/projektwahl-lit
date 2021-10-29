export declare type KeyFn<T> = (item: T, index: number) => unknown;
export declare type ItemTemplate<T> = (item: T, index: number) => unknown;
export interface PromiseDirectiveFn {
    <T, Q>(promise: Promise<T>, defaultValue: Q, resolveMapper: (v: T) => Q, rejectMapper: (v: any) => Q): unknown;
}
export declare const promise: PromiseDirectiveFn;
