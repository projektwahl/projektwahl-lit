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
import { FileHandle, mkdtemp, open, readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { constants, OpenMode, PathLike } from "node:fs";
import { execFile } from "node:child_process";
import { rawChoice } from "../../../lib/routes.js";
import { z } from "zod";
import { typedSql } from "../../describe.js";
import type { Abortable } from "node:events";
import type { TransactionSql } from "postgres";
import { sql } from "../../database.js";

async function readFileWithBacktrace(
  path: PathLike | FileHandle,
  options:
    | ({
        encoding: BufferEncoding;
        flag?: OpenMode | undefined;
      } & Abortable)
    | BufferEncoding
): Promise<string> {
  try {
    // nodejs is too stupid to create a backtrace here (there is an open issue about that)
    return await readFile(path, options);
  } catch (error) {
    throw new Error(String(error));
  }
}

const groupByNumber = <T>(
  data: T[],
  keySelector: (k: T) => number
): Record<number, T[]> => {
  const result: Record<number, T[]> = {};

  for (const datum of data) {
    const key = keySelector(datum);
    if (!(key in result)) {
      result[key] = [datum];
    } else {
      result[key].push(datum);
    }
  }

  return result;
};

export class CPLEXLP {
  dir!: string;
  filePath!: string;
  fileHandle!: FileHandle;
  solutionPath!: string;
  problemPath!: string;
  problemFreeMpsPath!: string;

  setup = async () => {
    this.dir = await mkdtemp(path.join(os.tmpdir(), "projektwahl-"));
    this.filePath = path.join(this.dir, "cplex.lp");
    this.fileHandle = await open(
      this.filePath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
      0o600
    );
  };

  startMaximize = async () => {
    await this.fileHandle.write(`Maximize\n obj: `);
  };

  maximize = async (factor: number, variable: string) => {
    if (factor !== 0) {
      await this.fileHandle.write(
        `\n ${factor < 0 ? "" : "+"}${factor} ${variable}`
      );
    }
  };

  startConstraints = async () => {
    await this.fileHandle.write(`\nSubject To`);
  };

  constraint = async (
    name: string,
    min: number | null,
    constraints: [number, string][],
    max: number | null
  ) => {
    if (min !== null && min === max) {
      await this.fileHandle.write(`\neq_${name}: `);
      for (const constraint of constraints) {
        await this.fileHandle.write(
          ` ${constraint[0] < 0 ? "" : "+"}${constraint[0]} ${constraint[1]}`
        );
      }
      await this.fileHandle.write(` = ${min}`);
    } else {
      if (min !== null) {
        await this.fileHandle.write(`\nmin_${name}: `);
        for (const constraint of constraints) {
          await this.fileHandle.write(
            ` ${constraint[0] < 0 ? "" : "+"}${constraint[0]} ${constraint[1]}`
          );
        }
        await this.fileHandle.write(` >= ${min}`);
      }
      if (max !== null) {
        await this.fileHandle.write(`\nmax_${name}: `);
        for (const constraint of constraints) {
          await this.fileHandle.write(
            ` ${constraint[0] < 0 ? "" : "+"}${constraint[0]} ${constraint[1]}`
          );
        }
        await this.fileHandle.write(` <= ${max}`);
      }
    }
  };

  startBounds = async () => {
    await this.fileHandle.write(`\nBounds\n`);
  };

  bound = async (min: number | null, name: string, max: number | null) => {
    await this.fileHandle.write(`\n`);
    if (min !== null) {
      await this.fileHandle.write(`${min} <= `);
    }
    await this.fileHandle.write(`${name}`);
    if (max !== null) {
      await this.fileHandle.write(` <= ${max}`);
    }
  };

  startVariables = async () => {
    await this.fileHandle.write(`\nGeneral\n`);
  };

  variable = async (name: string) => {
    await this.fileHandle.write(` ${name}`);
  };

  startBinaryVariables = async () => {
    await this.fileHandle.write(`\nBinary\n`);
  };

  binaryVariable = async (name: string) => {
    await this.fileHandle.write(` ${name}`);
  };

  calculate = async () => {
    await this.fileHandle.write(`\nEnd\n`);
    await this.fileHandle.close();

    this.solutionPath = path.join(this.dir, "solution.sol");
    this.problemPath = path.join(this.dir, "problem.glp");
    this.problemFreeMpsPath = path.join(this.dir, "problem.freemps");

    const childProcess = execFile(
      "glpsol",
      [
        "--lp",
        this.filePath,
        "--write",
        this.solutionPath,
        "--wglp",
        this.problemPath,
        "--wfreemps",
        this.problemFreeMpsPath,
      ],
      {}
    );

    if (childProcess.stdout) {
      for await (const chunk of childProcess.stdout) {
        console.log(chunk);
      }
    }

    if (childProcess.stderr) {
      for await (const chunk of childProcess.stderr) {
        console.error(chunk);
      }
    }

    const solution = (
      await readFileWithBacktrace(this.solutionPath, { encoding: "utf8" })
    ).split(/\r?\n/);

    const solutionFinal = Object.fromEntries(
      solution
        .filter((l) => l.startsWith("j "))
        .map((l) => l.split(" "))
        .map(([_j, index, value]) => [parseInt(index), parseInt(value)])
    );

    const problem = (
      await readFile(this.problemPath, { encoding: "utf8" })
    ).split(/\r?\n/);

    const problemFinal = problem
      .filter((l) => l.startsWith("n j "))
      .map((l) => l.split(" "))
      .map<[number, string]>(([_0, _1, index, name]) => [parseInt(index), name])
      .map<[string, number]>(([index, name]) => [name, solutionFinal[index]]);

    return problemFinal;
  };
}

export const rank2points = (rank: number) => {
  switch (rank) {
    case 0:
      return 0;
    case 1:
      return 11;
    case 2:
      return 7;
    case 3:
      return 4;
    case 4:
      return 2;
    case 5:
      return 1;
    default:
      throw new Error(`unknown rank ${rank}`);
  }
};

export async function evaluate(
  tsql: TransactionSql<Record<string, unknown>>,
  update: boolean
) {
  const lp = new CPLEXLP();
  await lp.setup();

  await tsql`SELECT set_config('projektwahl.type', 'root', true);`;

  const choices = z.array(rawChoice).parse(
    await tsql.file("src/server/routes/evaluate/calculate.sql", [], {
      cache: false,
    })
  );

  const projects = await typedSql(tsql, {
    columns: { id: 23, min_participants: 23, max_participants: 23 },
  } as const)`SELECT id, min_participants, max_participants FROM projects;`;

  const users = await typedSql(tsql, {
    columns: { id: 23, project_leader_id: 23 },
  } as const)`SELECT id, project_leader_id FROM present_voters WHERE force_in_project_id IS NULL ORDER BY id;`;

  console.log("choices: ", choices);
  console.log("projects: ", projects);
  console.log("users: ", users);

  const choicesGroupedByProject = groupByNumber(choices, (v) => v.project_id);

  const choicesGroupedByUser = groupByNumber(choices, (v) => v.user_id);

  await lp.startMaximize();

  for (const choice of choices) {
    await lp.maximize(
      rank2points(choice.rank),
      `choice_${choice.user_id}_${choice.project_id}`
    );
  }

  for (const project of projects) {
    await lp.maximize(-9000, `project_overloaded_${project.id}`);
    await lp.maximize(-9000, `project_underloaded_${project.id}`);
  }

  await lp.startConstraints();

  // exactly in one project or project leader
  for (const groupedChoice of Object.entries(choicesGroupedByUser)) {
    const a = groupedChoice[1].map<[number, string]>((choice) => [
      1,
      `choice_${choice.user_id}_${choice.project_id}`,
    ]);
    const user = users.find((u) => u.id == Number(groupedChoice[0]));

    if (user?.project_leader_id) {
      await lp.constraint(
        `only_in_one_project_${groupedChoice[0]}`,
        0,
        [...a, [-1, `project_not_exists_${user.project_leader_id}`]],
        0
      );
    } else {
      await lp.constraint(`only_in_one_project_${groupedChoice[0]}`, 1, a, 1);
    }
  }

  // only in project if it exists
  for (const choice of choices) {
    await lp.constraint(
      `project_must_exist_${choice.user_id}_${choice.project_id}`,
      null, // always greater than 0
      [
        [1, `choice_${choice.user_id}_${choice.project_id}`],
        [1, `project_not_exists_${choice.project_id}`],
      ],
      1
    );
  }

  // project size matches
  for (const project of projects) {
    await lp.constraint(
      `project_min_size_${project.id}`,
      project.min_participants,
      [
        ...(choicesGroupedByProject[project.id] || []).map<[number, string]>(
          (choice) => [1, `choice_${choice.user_id}_${choice.project_id}`]
        ),
        [1, `project_underloaded_${project.id}`],
        [project.min_participants, `project_not_exists_${project.id}`],
      ],
      null
    );

    await lp.constraint(
      `project_max_size_${project.id}`,
      0,
      [
        ...(choicesGroupedByProject[project.id] || []).map<[number, string]>(
          (choice) => [1, `choice_${choice.user_id}_${choice.project_id}`]
        ),
        [-1, `project_overloaded_${project.id}`],
        [project.max_participants, `project_not_exists_${project.id}`],
      ],
      project.max_participants
    );
  }

  await lp.startBounds();

  for (const project of projects) {
    await lp.bound(0, `project_overloaded_${project.id}`, null);
    await lp.bound(
      0,
      `project_underloaded_${project.id}`,
      Math.max(project.min_participants - 1, 0)
    ); // don't allow an empty project
  }

  await lp.startVariables();

  for (const project of projects) {
    await lp.variable(`project_overloaded_${project.id}`);
    await lp.variable(`project_underloaded_${project.id}`);
  }

  await lp.startBinaryVariables();

  for (const choice of choices) {
    await lp.binaryVariable(`choice_${choice.user_id}_${choice.project_id}`);
  }

  for (const project of projects) {
    await lp.binaryVariable(`project_not_exists_${project.id}`);
  }

  const results = await lp.calculate();

  /*for (const result of results) {
    console.log(result);
  }*/

  const finalOutput: {
    overloaded: [number, number][];
    underloaded: [number, number][];
    notexists: number[];
    choices: [number, number, number][];
  } = {
    overloaded: [],
    underloaded: [],
    notexists: [],
    choices: [],
  };

  for (const result of results
    .filter(([name]) => name.startsWith("project_overloaded"))
    .map<[number, number]>(([name, value]) => {
      return [parseInt(name.split("_")[2]), value];
    })) {
    if (result[1] > 0) {
      finalOutput.overloaded.push(result);
      console.log(
        `WARNING: PROJECT OVERLOADED: project ${result[0]} with ${result[1]} people too much`
      );
    }
  }

  for (const result of results
    .filter(([name]) => name.startsWith("project_underloaded"))
    .map<[number, number]>(([name, value]) => {
      return [parseInt(name.split("_")[2]), value];
    })) {
    if (result[1] > 0) {
      finalOutput.underloaded.push(result);
      console.log(
        `WARNING: PROJECT UNDERLOADED: project ${result[0]} with ${result[1]} people too few`
      );
    }
  }

  for (const result of results
    .filter(([name]) => name.startsWith("project_not_exists"))
    .map<[number, number]>(([name, value]) => {
      return [parseInt(name.split("_")[3]), value];
    })) {
    if (result[1] != 0) {
      finalOutput.notexists.push(result[0]);
      console.log(`WARNING: PROJECT NOT EXISTS: project ${result[0]}`);
    }
  }

  const rank_distribution = [0, 0, 0, 0, 0, 0];

  const keyed_choices = Object.fromEntries(
    choices.map((c) => [`${c.user_id}_${c.project_id}`, c])
  );

  for (const result of results
    .filter(([name]) => name.startsWith("choice_"))
    .map<[number, number, number]>(([name, value]) => {
      return [
        parseInt(name.split("_")[1]),
        parseInt(name.split("_")[2]),
        value,
      ];
    })) {
    const choice = keyed_choices[`${result[0]}_${result[1]}`];
    if (!choice) {
      throw new Error("something went wrong. couldn't find that choice");
    }
    if (result[2] != 0) {
      finalOutput.choices.push([result[0], result[1], choice.rank]);
      /*console.log(
        `user: ${choice.user_id}, project: ${choice.project_id}, rank: ${choice.rank}`
      );*/
      rank_distribution[choice.rank]++;
    }
  }

  console.log(finalOutput);

  console.log(finalOutput.choices);
  await sql.begin(async (tsql) => {
    await tsql`SELECT set_config('projektwahl.type', 'admin', true);`;
    await tsql`UPDATE users SET computed_in_project_id = NULL, last_updated_by = (SELECT id FROM users_with_deleted WHERE type = 'admin') WHERE computed_in_project_id IS NOT NULL;`; // reset previous computed
    for (const choice of finalOutput.choices) {
      await tsql`UPDATE users SET computed_in_project_id = ${choice[1]}, last_updated_by = (SELECT id FROM users_with_deleted WHERE type = 'admin') WHERE id = ${choice[0]}`;
    }
  });

  console.log(rank_distribution);

  return finalOutput;
}
