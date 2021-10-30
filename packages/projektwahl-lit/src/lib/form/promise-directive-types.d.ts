export type KeyFn<T> = (item: T, index: number) => unknown;
export type ItemTemplate<T> = (item: T, index: number) => unknown;

export interface PromiseDirectiveFn {
  <T, Q>(
    promise: Promise<T>,
    defaultValue: Q,
    resolveMapper: (v: T) => Q,
    rejectMapper: (v: any) => Q
  ): unknown;
}
