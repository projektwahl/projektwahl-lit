import { sql } from "../../src/server/database.js";
import { Chance } from "chance";
import { evaluate } from "../../src/server/routes/evaluate/index.js";
import { userInfo } from "os";

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
  return (await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) VALUES (${chance.sentence()}, '', '', 0, ${min_age}, ${max_age}, ${min_participants}, ${max_participants}, ${random_assignments}) RETURNING projects.id;`)[0].id;
}

export async function user(age: number) {
    return (await sql`INSERT INTO users (username, type, "group", age, last_updated_by) VALUES (${chance.name(
        { prefix: true, suffix: true }
      )}, 'voter', '', ${age}, 1) RETURNING users.id;`)[0].id
}

export async function vote(project_id: number, user_id: number, rank: number) {
    await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${
        user_id
      }, ${project_id}, ${rank});`
}

export async function test1() {
  await reset();
  await project();
  await evaluate();
}

// ignore for now - this creates an invalid file
// test1()

export async function test2() {
    await reset();
    const p0 = await project();
    const u0 = await user(5);
    await vote(p0, u0, 1);
    await evaluate();
  }