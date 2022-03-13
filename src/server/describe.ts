import { sql } from "./database.js";

const description = {
  types: [23],
  columns: [
    { name: "id", type: 23 },
    { name: "username", type: 1043 },
    { name: "openid_id", type: 1043 },
    { name: "password_hash", type: 1043 },
    { name: "type", type: 17425 },
    { name: "project_leader_id", type: 23 },
    { name: "group", type: 1043 },
    { name: "age", type: 23 },
    { name: "away", type: 16 },
    { name: "password_changed", type: 16 },
    {
      name: "force_in_project_id",
      type: 23,
    },
    {
      name: "computed_in_project_id",
      type: 23,
    },
    { name: "deleted", type: 16 },
    { name: "last_updated_by", type: 23 },
  ],
} as const;

type DescriptionQueryTypes<T extends any[]> = {
    [Property in keyof T]: T[Property] extends 23 ? number : unknown;
};

type DescriptionResultTypes<T extends ({ name: string; type: number })[]> = {
  [Property in keyof T as T[Property]["name"]]: T[Property]["type"] extends 23 ? number : unknown;
};

const args: DescriptionQueryTypes<typeof description["types"]> = [1];

const test: DescriptionResultTypes<typeof description["columns"]>;

console.log(await sql`SELECT * FROM users WHERE id = ${1}`.describe());
console.log(await sql`SELECT * FROM users WHERE id = ${1}`.execute());

await sql.end();
