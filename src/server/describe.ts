import { deepStrictEqual } from "assert";
import type { Sql } from "postgres";

type NullableObject<Type> = {
  [Property in keyof Type]: Type[Property] | null;
};

// stack traces are garbage
export function typedSql<
  Q extends readonly (number | null)[],
  R extends { [column: string]: number | null }
>(sql: Sql<Record<string, never>>, description: { types: Q; columns: R }) {
  return async function test(
    template: TemplateStringsArray,
    ...args: NullableObject<DescriptionTypes<Q>>
  ) {
    //const err = new Error().stack
    //try {
    const { types: computed_query_types, columns: computed_column_types_1 } =
      // @ts-expect-error unknown
      await sql(template, ...args).describe();

    const computed_column_types: {
      [k: string]: number | null;
    } = Object.fromEntries(
      computed_column_types_1.map((v) => [v.name, v.type])
    );

    const computed_description: {
      types: (number | null)[];
      columns: {
        [k: string]: number | null;
      };
    } = {
      types: computed_query_types,
      columns: computed_column_types,
    };

    for (let i = 0; i < description.types.length; i++) {
      if (description.types[i] === null) {
        computed_description.types[i] = null;
      }
    }

    for (const [key, value] of Object.entries(description.columns)) {
      if (value === null) {
        computed_description.columns[key] = null;
      }
    }

    console.log(computed_description);

    deepStrictEqual(computed_description, description);

    // @ts-expect-error unknown
    return await sql<DescriptionTypes<R>[]>(template, ...args).execute();
    /*} catch (error) {
    console.error(err)
    throw error
  }*/
  };
}

// https://github.com/porsager/postgres/blob/rewrite/src/types.js
type DescriptionTypes<T> = {
  -readonly [K in keyof T]: T[K] extends 23 | 701
    ? number
    : T[K] extends 1043
    ? string
    : T[K] extends 16
    ? boolean
    : T[K] extends 17
    ? Uint8Array
    : T[K] extends null
    ? string
    : unknown;
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
