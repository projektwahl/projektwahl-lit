/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { sql } from "../../src/server/database.js";
import { Chance } from "chance";
import { evaluate } from "../../src/server/routes/evaluate/index.js";
import { deepEqual } from "assert/strict";
import { typedSql } from "../../src/server/describe.js";

const chance = new Chance();

export {};

export async function reset() {
  await sql`DROP TABLE IF EXISTS settings, sessions, choices_history, projects_history, users_history, choices, users_with_deleted, projects_with_deleted CASCADE;`;
  await sql.begin(async (tsql) => {
    await tsql.file("src/server/setup.sql");
  });
}

export async function project(
  min_participants = 5,
  max_participants = 15,
  min_age = 5,
  max_age = 13,
  random_assignments = true
): Promise<number> {
  return (
    await typedSql(sql, {
      columns: { id: 23 },
    } as const)`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) VALUES (${chance.sentence()}, '', '', 0, ${min_age}, ${max_age}, ${min_participants}, ${max_participants}, ${random_assignments}, NULL) RETURNING projects.id;`
  )[0].id;
}

export async function user(age: number): Promise<number> {
  return (
    await typedSql(sql, {
      columns: { id: 23 },
    } as const)`INSERT INTO users (username, type, "group", age, last_updated_by) VALUES (${chance.name(
      { prefix: true, suffix: true }
    )}, 'voter', '', ${age}, NULL) RETURNING users.id;`
  )[0].id;
}

export async function vote(project_id: number, user_id: number, rank: number) {
  await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user_id}, ${project_id}, ${rank});`;
}

export async function test_only_one_user() {
  await reset();
  const _u1 = await user(5);
  deepEqual(await evaluate(), {});
}

// ignore for now - this creates an invalid file
// await test_only_one_user()

export async function test_only_one_project() {
  await reset();
  const _p1 = await project();
  deepEqual(await evaluate(), {});
}

// ignore for now - this creates an invalid file
// test_only_one_project()

export async function test_one_project_one_user_correct_age() {
  await reset();
  const _p1 = await project();
  const _u1 = await user(5);
  deepEqual(await evaluate(), {
    overloaded: [],
    underloaded: [[1, 4]],
    notexists: [],
    choices: [[1, 1, 0]],
  });
}

await test_one_project_one_user_correct_age();

export async function test_one_project_one_user_wrong_age() {
  await reset();
  const _p1 = await project();
  const _u1 = await user(4);
  // TODO FIXME HERE IS A BUG: IF NO PROJECTS ARE FOUND FOR A USER WITH THEIR AGE
  // we need to show an error
  //deepEqual(await evaluate(), { });
}

await test_one_project_one_user_wrong_age();

export async function test_five_projects_one_user() {
  await reset();
  const _p1 = await project();
  const _p2 = await project();
  const _p3 = await project();
  const _p4 = await project();
  const _p5 = await project();
  const _u1 = await user(5);
  deepEqual(await evaluate(), {
    overloaded: [],
    underloaded: [[5, 4]],
    notexists: [1, 2, 3, 4],
    choices: [[1, 5, 0]],
  });
}

await test_five_projects_one_user();

export async function test_one_user_one_project_voted_incorrectly() {
  await reset();
  const p1 = await project();
  const u1 = await user(5);
  await vote(p1, u1, 1);
  deepEqual(await evaluate(), {
    overloaded: [],
    underloaded: [[1, 4]],
    notexists: [],
    choices: [[1, 1, 0]], // see the rank 0 here
  });
}

await test_one_user_one_project_voted_incorrectly();

export async function test_five_projects_one_user_voted_correctly() {
  await reset();
  const _p1 = await project();
  const _p2 = await project();
  const _p3 = await project();
  const _p4 = await project();
  const _p5 = await project();
  const _u1 = await user(5);
  deepEqual(await evaluate(), {
    overloaded: [],
    underloaded: [[5, 4]],
    notexists: [1, 2, 3, 4],
    choices: [[1, 5, 0]],
  });
}

await test_five_projects_one_user_voted_correctly();

await sql.end();
