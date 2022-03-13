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

type DescriptionTypes<T> = {
  -readonly [Property in keyof T]: T[Property] extends 23 ? number : T[Property] extends 1043 ? string : T[Property] extends 16 ? boolean : T[Property] extends 17425 ? string : unknown;
};

type A = DescriptionTypes<typeof description["columns"]>[]
type B = DescriptionTypes<typeof description["types"]>

const { types: computed_query_types, columns: computed_column_types_1 } = await sql<A, B>`SELECT * FROM users WHERE id = ${1}`.describe()

const computed_column_types = Object.fromEntries(computed_column_types_1.map(v => [v.name, v.type]))

const computed_description = {
  types: computed_query_types,
  columns: computed_column_types
}

deepStrictEqual(computed_description, description)

console.log(computed_description);
console.log(await sql<DescriptionTypes<typeof description["columns"]>[], DescriptionTypes<typeof description["types"]>>`SELECT * FROM users WHERE id = ${1}`.execute());

await sql.end();
