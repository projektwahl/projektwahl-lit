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
import type { TransactionSql } from "postgres";

const chance = new Chance();

export async function reset() {
  await sql`DROP TABLE IF EXISTS settings, sessions, choices_history, projects_history, users_history, choices, users_with_deleted, projects_with_deleted CASCADE;`;
  await sql.begin(async (tsql) => {
    await tsql.file("src/server/setup.sql");
  });
}

export async function project(
  tsql: TransactionSql<Record<string, unknown>>,
  min_participants = 5,
  max_participants = 15,
  min_age = 5,
  max_age = 13,
  random_assignments = true
): Promise<number> {
  return (
    await typedSql(tsql, {
      columns: { id: 23 },
    } as const)`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) VALUES (${chance.sentence()}, '', '', 0, ${min_age}, ${max_age}, ${min_participants}, ${max_participants}, ${random_assignments}, NULL) RETURNING projects.id;`
  )[0].id;
}

export async function user(
  tsql: TransactionSql<Record<string, unknown>>,
  age: number,
  project_leader_id: number | null = null
): Promise<number> {
  await tsql`SELECT set_config('projektwahl.id', 0::text, true);`;
  await tsql`SELECT set_config('projektwahl.type', 'root', true);`;
  return (
    await typedSql(tsql, {
      columns: { id: 23 },
    } as const)`INSERT INTO users (username, type, "group", age, project_leader_id, last_updated_by) VALUES (${`user${chance.integer()}`}, 'voter', '', ${age}, ${project_leader_id}, NULL) RETURNING users.id;`
  )[0].id;
}

export async function vote(
  tsql: TransactionSql<Record<string, unknown>>,
  project_id: number,
  user_id: number,
  rank: number
) {
  await tsql`INSERT INTO choices (user_id, project_id, rank) VALUES (${user_id}, ${project_id}, ${rank}) ON CONFLICT DO NOTHING;`;
}

export async function test_only_one_user() {
  await reset();
  await sql.begin(async (tsql) => {
    const _u1 = await user(tsql, 5);
    deepEqual(await evaluate(tsql, false), {});
  });
}

// ignore for now - this creates an invalid file
// await test_only_one_user()

export async function test_only_one_project() {
  await reset();
  await sql.begin(async (tsql) => {
    const _p1 = await project(tsql);
    deepEqual(await evaluate(tsql, false), {});
  });
}

// ignore for now - this creates an invalid file
// test_only_one_project()

export async function test_one_project_one_user_correct_age() {
  await reset();
  await sql.begin(async (tsql) => {
    const _p1 = await project(tsql);
    const _u1 = await user(tsql, 5);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [[1, 4]],
      notexists: [],
      choices: [[1, 1, 0]],
    });
  });
}

await test_one_project_one_user_correct_age();

export async function test_one_project_one_user_wrong_age() {
  await reset();
  await sql.begin(async (tsql) => {
    const _p1 = await project(tsql);
    const _u1 = await user(tsql, 4);
    // TODO FIXME HERE IS A BUG: IF NO PROJECTS ARE FOUND FOR A USER WITH THEIR AGE
    // we need to show an error
    //deepEqual(await evaluate(tsql, false), { });
  });
}

await test_one_project_one_user_wrong_age();

export async function test_five_projects_one_user() {
  await reset();
  await sql.begin(async (tsql) => {
    const _p1 = await project(tsql);
    const _p2 = await project(tsql);
    const _p3 = await project(tsql);
    const _p4 = await project(tsql);
    const _p5 = await project(tsql);
    const _u1 = await user(tsql, 5);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [[5, 4]],
      notexists: [1, 2, 3, 4],
      choices: [[1, 5, 0]],
    });
  });
}

await test_five_projects_one_user();

export async function test_one_user_one_project_voted_incorrectly() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql);
    const u1 = await user(tsql, 5);
    await vote(tsql, p1, u1, 1);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [[1, 4]],
      notexists: [],
      choices: [[1, 1, 0]], // see the rank 0 here
    });
  });
}

await test_one_user_one_project_voted_incorrectly();

export async function test_five_projects_one_user_voted_correctly() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql);
    const p2 = await project(tsql);
    const p3 = await project(tsql);
    const p4 = await project(tsql);
    const p5 = await project(tsql);
    const u1 = await user(tsql, 5);
    await vote(tsql, p1, u1, 4);
    await vote(tsql, p2, u1, 5);
    await vote(tsql, p3, u1, 3);
    await vote(tsql, p4, u1, 1);
    await vote(tsql, p5, u1, 2);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [[4, 4]],
      notexists: [1, 2, 3, 5],
      choices: [[1, 4, 1]],
    });
  });
}

await test_five_projects_one_user_voted_correctly();

export async function test_five_projects_conflicting_equal_votes() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 1, 1);
    const p2 = await project(tsql, 1, 1);
    const p3 = await project(tsql, 1, 1);
    const p4 = await project(tsql, 1, 1);
    const p5 = await project(tsql, 1, 1);
    const u1 = await user(tsql, 5);
    const u2 = await user(tsql, 5);
    await vote(tsql, p1, u1, 4);
    await vote(tsql, p2, u1, 5);
    await vote(tsql, p3, u1, 3);
    await vote(tsql, p4, u1, 1);
    await vote(tsql, p5, u1, 2);

    await vote(tsql, p1, u2, 4);
    await vote(tsql, p2, u2, 5);
    await vote(tsql, p3, u2, 3);
    await vote(tsql, p4, u2, 1);
    await vote(tsql, p5, u2, 2);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [],
      notexists: [1, 2, 3],
      choices: [
        /*[1, 4, 1],
      [2, 5, 2],*/
        [1, 5, 2],
        [2, 4, 1],
      ],
    });
  });
}

await test_five_projects_conflicting_equal_votes();

export async function test_five_projects_different_conflicting_votes() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 0, 0);
    const p2 = await project(tsql, 0, 0); // fake project
    const p3 = await project(tsql, 0, 0); // fake project
    const p4 = await project(tsql, 0, 0); // fake project
    const p5 = await project(tsql, 1, 1); // fake project
    const u1 = await user(tsql, 5);
    const u2 = await user(tsql, 5);
    await vote(tsql, p1, u1, 4);
    await vote(tsql, p2, u1, 5);
    await vote(tsql, p3, u1, 3);
    await vote(tsql, p4, u1, 1);
    await vote(tsql, p5, u1, 2);

    await vote(tsql, p1, u2, 4);
    await vote(tsql, p2, u2, 5);
    await vote(tsql, p3, u2, 3);
    await vote(tsql, p4, u2, 2); // different
    await vote(tsql, p5, u2, 1); // different
    deepEqual(await evaluate(tsql, false), {
      overloaded: [[4, 1]],
      underloaded: [],
      notexists: [],
      choices: [
        [1, 4, 1],
        [2, 5, 1],
      ],
    });
  });
}

await test_five_projects_different_conflicting_votes();

export async function test_five_projects_different_votes() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 1, 1);
    const p2 = await project(tsql, 1, 1);
    const p3 = await project(tsql, 1, 1);
    const p4 = await project(tsql, 1, 1);
    const p5 = await project(tsql, 1, 1);
    const u1 = await user(tsql, 5);
    const u2 = await user(tsql, 5);
    await vote(tsql, p1, u1, 4);
    await vote(tsql, p2, u1, 5);
    await vote(tsql, p3, u1, 3);
    await vote(tsql, p4, u1, 1);
    await vote(tsql, p5, u1, 2);

    await vote(tsql, p1, u2, 4);
    await vote(tsql, p2, u2, 5);
    await vote(tsql, p3, u2, 3);
    await vote(tsql, p4, u2, 2); // different
    await vote(tsql, p5, u2, 1); // different
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [],
      notexists: [1, 2, 3],
      choices: [
        [1, 4, 1],
        [2, 5, 1],
      ],
    });
  });
}

await test_five_projects_different_votes();

export async function test_project_leader() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 0, 0);
    const _u1 = await user(tsql, 5, p1);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [],
      notexists: [],
      choices: [],
    });
  });
}

await test_project_leader();

export async function test_not_project_leader() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 1, 1);
    const _u1 = await user(tsql, 5, p1);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [],
      notexists: [1],
      choices: [],
    });
  });
}

await test_not_project_leader();

export async function test_not_project_leader_voted_correctly() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 1, 1);
    const p2 = await project(tsql);
    const p3 = await project(tsql);
    const p4 = await project(tsql);
    const p5 = await project(tsql);
    const p6 = await project(tsql);
    const u1 = await user(tsql, 5, p1);
    await vote(tsql, p2, u1, 1);
    await vote(tsql, p3, u1, 2);
    await vote(tsql, p4, u1, 3);
    await vote(tsql, p5, u1, 4);
    await vote(tsql, p6, u1, 5);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [[2, 4]],
      notexists: [1, 3, 4, 5, 6],
      choices: [[1, 2, 1]],
    });
  });
}

await test_not_project_leader_voted_correctly();

export async function test_not_project_leader_voted_correctly2() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 1, 1);
    const p2 = await project(tsql, 1, 1);
    const p3 = await project(tsql, 1, 1);
    const p4 = await project(tsql, 1, 1);
    const p5 = await project(tsql, 1, 1);
    const p6 = await project(tsql, 1, 1);
    const u1 = await user(tsql, 5, p1);
    await vote(tsql, p2, u1, 1);
    await vote(tsql, p3, u1, 2);
    await vote(tsql, p4, u1, 3);
    await vote(tsql, p5, u1, 4);
    await vote(tsql, p6, u1, 5);
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [],
      notexists: [1, 3, 4, 5, 6],
      choices: [[1, 2, 1]],
    });
  });
}

await test_not_project_leader_voted_correctly2();

export async function test_regression_418() {
  await reset();
  await sql.begin(async (tsql) => {
    const p1 = await project(tsql, 1, 1, 0, 10, false);
    const p2 = await project(tsql, 1, 1, 0, 10, false);
    const p3 = await project(tsql, 1, 1, 0, 10, false);
    const p4 = await project(tsql, 1, 1, 0, 10, false);
    const p5 = await project(tsql, 1, 1, 0, 10, false);
    const u1 = await user(tsql, 5);
    await vote(tsql, p1, u1, 1);
    await vote(tsql, p2, u1, 1);
    await vote(tsql, p3, u1, 1);
    await vote(tsql, p4, u1, 1);
    await vote(tsql, p5, u1, 1);

    // this is wrong!!!
    deepEqual(await evaluate(tsql, false), {
      overloaded: [],
      underloaded: [],
      notexists: [1, 2, 3, 4],
      choices: [[1, 5, 1]],
    });
  });
}

await test_regression_418();

export async function test_extreme() {
  // TODO FIXME shouldn't this already overload?
  await sql.begin(async (tsql) => {
    const projects: number[] = [];
    for (let i = 0; i < 200; i++) {
      projects.push(await project(tsql));
    }

    const users: number[] = [];
    for (let i = 0; i < 3000; i++) {
      const currentUser = await user(tsql, 5);
      users.push(currentUser);
      for (let j = 1; j <= 5; j++) {
        await vote(
          tsql,
          projects[chance.integer({ min: 0, max: projects.length - 1 })],
          currentUser,
          j
        );
      }
    }

    await evaluate(tsql, false);
  });
}

await test_extreme();

await sql.end();

/*
32s
time glpsol --lp /tmp/nix-shell.rMXcKH/projektwahl-1ftrhx/cplex.lp

42s
time glpsol --cgr --lp /tmp/nix-shell.rMXcKH/projektwahl-1ftrhx/cplex.lp

39s
time glpsol --cbg --lp /tmp/nix-shell.rMXcKH/projektwahl-1ftrhx/cplex.lp

1m59s
lp_solve -v5 -max -fmps /tmp/nix-shell.rMXcKH/projektwahl-fOnCpY/problem.freemps

1m31s
time lp_solve -piv3 -max -v5 -fmps /tmp/nix-shell.rMXcKH/projektwahl-fOnCpY/problem.freemps

2s
time cbc /tmp/nix-shell.rMXcKH/projektwahl-fOnCpY/problem.freemps -max -dualsimplex

*/
