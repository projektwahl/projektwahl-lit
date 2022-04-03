import { sql } from "../../src/server/database.js";
import { Chance } from "chance";
import { evaluate } from "../../src/server/routes/evaluate/index.js";

const chance = new Chance();

export {};

export async function reset() {
  await sql`DROP TABLE IF EXISTS settings, sessions, choices_history, projects_history, users_history, choices, users_with_deleted, projects_with_deleted CASCADE;`;
  await sql.begin(async (tsql) => {
    await tsql.file("src/server/setup.sql");
  });
}

export async function project(
  min_participants: number = 5,
  max_participants: number = 15,
  min_age: number = 5,
  max_age: number = 13,
  random_assignments: boolean = true
) {
  sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) VALUES (${chance.sentence()}, '', '', 0, ${min_age}, ${max_age}, ${min_participants}, ${max_participants}, ${random_assignments})`;
}

export async function test1() {
  await reset();
  await project();
  await evaluate();
}
