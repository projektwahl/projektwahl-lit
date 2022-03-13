import { deepStrictEqual } from "assert";
import type { Sql } from "postgres";

/*
import { sql } from "./database.js";

const description = {
  types: [23, 16],
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
    last_updated_by: 23,
  },
} as const;
*/

// stack traces are garbage
export function typedSql<
  Q extends readonly number[],
  R extends { [column: string]: number }
>(sql: Sql<Record<string, never>>, description: { types: Q; columns: R }) {
  return async function test(
    template: TemplateStringsArray,
    ...args: DescriptionTypes<Q>
  ) {
    //const err = new Error().stack
    //try {
    const { types: computed_query_types, columns: computed_column_types_1 } =
      await sql(template, ...args).describe();

    const computed_column_types = Object.fromEntries(
      computed_column_types_1.map((v) => [v.name, v.type])
    );

    const computed_description = {
      types: computed_query_types,
      columns: computed_column_types,
    };

    console.log(computed_description)

    deepStrictEqual(computed_description, description);

    return await sql<DescriptionTypes<R>[]>(template, ...args).execute();
  /*} catch (error) {
    console.error(err)
    throw error
  }*/
  };
}

type DescriptionTypes<T> = {
  -readonly [K in keyof T]: (T[K] extends 23
    ? number
    : T[K] extends 1043
    ? string
    : T[K] extends 16
    ? boolean
    : T[K] extends 17 ? Uint8Array
    : never) | null;
};
/*
const results = await typedSql(
  sql,
  description
)`SELECT * FROM users WHERE id = ${1} AND away = ${false}`;

console.log(results);

console.log(results[0].type);

await sql.end();
*/