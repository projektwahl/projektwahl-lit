import type { PendingQuery, SerializableParameter, TransactionSql } from "postgres";
export declare function typedSql<R extends {
    [column: string]: number | null;
}>(sql: TransactionSql<Record<string, unknown>>, description: {
    columns: R;
}): (template: TemplateStringsArray, ...args: (SerializableParameter | PendingQuery<any>)[]) => Promise<import("postgres").RowList<DescriptionTypes<R>[]>>;
export type DescriptionTypes<T> = {
    -readonly [K in keyof T]: T[K] extends 23 | 701 ? number : T[K] extends 1043 ? string : T[K] extends 16 ? boolean : T[K] extends 17 ? Uint8Array : T[K] extends null ? string : unknown;
};
