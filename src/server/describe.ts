import { deepStrictEqual } from "assert";
import { sql } from "./database.js";

const description = {
  types: [ 23 ],
  columns: {
    id: 23,
    username: 1043,
    openid_id: 1043,
    password_hash: 1043,
    type: 17425,
    project_leader_id: 23,
    group: 1043,
    age: 23,
    away: 16,
    password_changed: 16,
    force_in_project_id: 23,
    computed_in_project_id: 23,
    deleted: 16,
    last_updated_by: 23
  }
} as const;

export function typedSql<D extends { types: readonly number[]; columns: { [column: string]: number } }>(description: D) {
  return async (template: TemplateStringsArray, ...args: DescriptionQueryTypes<D["types"]>) => {
    const { types: computed_query_types, columns: computed_column_types_1 } = await sql(template, args).describe()

    const computed_column_types = Object.fromEntries(computed_column_types_1.map(v => [v.name, v.type]))

    const computed_description = {
      types: computed_query_types,
      columns: computed_column_types
    }

    deepStrictEqual(computed_description, description)

    return await sql<DescriptionResultTypes<D["columns"]>[]>(template, args).execute()
  }
}

type DescriptionQueryTypes<T> = {
  -readonly [Property in keyof T]: Property extends number ? (T[Property] extends 23 ? number : T[Property] extends 1043 ? string : T[Property] extends 16 ? boolean : T[Property] extends 17425 ? string : unknown) : never;
};

type DescriptionResultTypes<T> = {
  -readonly [Property in keyof T]: Property extends number ? (T[Property] extends 23 ? number : T[Property] extends 1043 ? string : T[Property] extends 16 ? boolean : T[Property] extends 17425 ? string : unknown) : never;
};

const results = await typedSql(description)`SELECT * FROM users WHERE id = ${1}`

await sql.end();
