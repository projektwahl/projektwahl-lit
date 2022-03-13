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
};

console.log(await sql`SELECT * FROM users WHERE id = ${1}`.describe());
console.log(await sql`SELECT * FROM users WHERE id = ${1}`.execute());

await sql.end();
