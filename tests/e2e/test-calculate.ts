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
  return (
    await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) VALUES (${chance.sentence()}, '', '', 0, ${min_age}, ${max_age}, ${min_participants}, ${max_participants}, ${random_assignments}, NULL) RETURNING projects.id;`
  )[0].id;
}

export async function user(age: number) {
  return (
    await sql`INSERT INTO users (username, type, "group", age, last_updated_by) VALUES (${chance.name(
      { prefix: true, suffix: true }
    )}, 'voter', '', ${age}, NULL) RETURNING users.id;`
  )[0].id;
}

export async function vote(project_id: number, user_id: number, rank: number) {
  await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user_id}, ${project_id}, ${rank});`;
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
  //await vote(p0, u0, 1);
  await evaluate();
}

// ignore for now - less than five projects
//await test2();

export async function test3() {
  await reset();
  const p0 = await project();
  const p1 = await project();
  const p2 = await project();
  const p3 = await project();
  const p4 = await project();
  const u0 = await user(5);
  await evaluate();
}

await test3();
