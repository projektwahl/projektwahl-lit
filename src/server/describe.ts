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
    [Property in keyof T]: T[Property] extends 23 ? number : unknown;
};

/*
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#further-exploration
type EventConfig<Events extends { kind: string }> = {
  [E in Events as E["kind"]]: (event: E) => void;
}
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};
*/
const args: DescriptionTypes<typeof description["types"]> = [1];

let test: DescriptionTypes<typeof description["columns"]>;

const { types: computed_query_types, columns: computed_column_types_1 } = await sql`SELECT * FROM users WHERE id = ${1}`.describe()

const computed_column_types = Object.fromEntries(computed_column_types_1.map(v => [v.name, v.type]))

const computed_description = {
  types: computed_query_types,
  columns: computed_column_types
}

console.log(computed_description);
console.log(await sql`SELECT * FROM users WHERE id = ${1}`.execute());

await sql.end();
