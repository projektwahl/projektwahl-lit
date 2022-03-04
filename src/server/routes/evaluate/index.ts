import { FileHandle, mkdtemp, open, readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { constants, read } from "node:fs";
import { execFile } from "node:child_process";
import { sql } from "../../database.js";
import groupBy from "lodash-es/groupBy.js";
import sortedIndexBy from "lodash-es/sortedIndexBy.js";

export class CPLEXLP {
  constructor() {}

  dir!: string;
  filePath!: string;
  fileHandle!: FileHandle;
  solutionPath!: string;
  problemPath!: string;

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

  endMaximize = async () => {};

  startConstraints = async () => {
    await this.fileHandle.write(`\nSubject To`);
  };

  constraint = async (
    name: string,
    min: number | null,
    constraints: [number, string][],
    max: number | null
  ) => {
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
  };

  endConstraints = async () => {};

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

  endBounds = async () => {};

  startVariables = async () => {
    await this.fileHandle.write(`\nGeneral\n`);
  };

  variable = async (name: string) => {
    await this.fileHandle.write(` ${name}`);
  };

  endVariables = async () => {};

  startBinaryVariables = async () => {
    await this.fileHandle.write(`\nBinary\n`);
  };

  binaryVariable = async (name: string) => {
    await this.fileHandle.write(` ${name}`);
  };

  endBinaryVariables = async () => {};

  calculate = async () => {
    await this.fileHandle.write(`\nEnd\n`);
    await this.fileHandle.close();

    this.solutionPath = path.join(this.dir, "solution.sol");
    this.problemPath = path.join(this.dir, "problem.glp");

    const childProcess = execFile(
      "glpsol",
      [
        "--lp",
        this.filePath,
        "--write",
        this.solutionPath,
        "--wglp",
        this.problemPath,
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

    const exitCode = await new Promise((resolve, _reject) => {
      childProcess.on("close", resolve);
    });

    const solution = (
      await readFile(this.solutionPath, { encoding: "utf8" })
    ).split(/\r?\n/);

    const solutionFinal = Object.fromEntries(
      solution
        .filter((l) => l.startsWith("j "))
        .map((l) => l.split(" "))
        .map(([_, index, value]) => [parseInt(index), parseInt(value)])
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

const lp = new CPLEXLP();
await lp.setup();

const choices = await sql.file("src/server/routes/evaluate/calculate.sql", [], {
  cache: false,
});

// TODO FIXME database transaction to ensure consistent view of data
const projects =
  await sql`SELECT id, min_participants, max_participants FROM projects;`;

const users =
  await sql`SELECT id, project_leader_id FROM present_voters ORDER BY id;`;

const choicesGroupedByProject = groupBy(choices, (c) => c.project_id);

const choicesGroupedByUser = groupBy(choices, (c) => c.user_id);

await lp.startMaximize();

for (const choice of choices) {
  await lp.maximize(
    rank2points(choice.rank),
    `choice_${choice.user_id}_${choice.project_id}`
  );
}

// overloaded projects should make this way worse
// maybe in the constraints to choice1 + choice2 + choice3 + overload <= max_participants
// then put overload in here. This *should* work (but probably doesn't)

for (const project of projects) {
  await lp.maximize(-9000, `project_overloaded_${project.id}`);
  await lp.maximize(-9000, `project_underloaded_${project.id}`);
}

await lp.endMaximize();

await lp.startConstraints();

// only in one project or project leader
for (const groupedChoice of Object.entries(choicesGroupedByUser)) {
  await lp.constraint(
    `only_in_one_project_${groupedChoice[0]}`,
    0,
    [
      ...groupedChoice[1].map<[number, string]>((choice) => [
        1,
        `choice_${choice.user_id}_${choice.project_id}`,
      ]),
      ...(sortedIndexBy(users, { id: groupedChoice[0] }, (u) => u.id)
        ? ([[1, `project_leader_${groupedChoice[0]}`]] as [number, string][])
        : []),
    ],
    1
  );
}

// only in project if it exists
for (const choice of choices) {
  await lp.constraint(
    `project_must_exist_${choice.user_id}_${choice.project_id}`,
    0,
    [
      [1, `choice_${choice.user_id}_${choice.project_id}`],
      [1, `project_not_exists_${choice.project_id}`],
    ],
    1
  );
}

// either project leader or project does not exist
for (const user of users) {
  if (user.project_leader_id === null) continue;
  await lp.constraint(
    `either_project_leader_or_project_not_exists_${user.id}`,
    0,
    [
      [1, `project_leader_${user.id}`],
      [1, `project_not_exists_${user.project_leader_id}`],
    ],
    1
  );
}

// project size matches
for (const project of projects) {
  await lp.constraint(
    `project_max_size_${project.id}`,
    0,
    [
      ...(choicesGroupedByProject[project.id] || []).map<[number, string]>(
        (choice) => [1, `choice_${choice.user_id}_${choice.project_id}`]
      ),
      [-1, `project_overloaded_${project.id}`],
    ],
    project.max_participants
  );
}

await lp.endConstraints();

await lp.startBounds();

for (const project of projects) {
  await lp.bound(0, `project_overloaded_${project.id}`, null);
  await lp.bound(0, `project_underloaded_${project.id}`, null);
}

await lp.endBounds();

await lp.startVariables();

for (const project of projects) {
  await lp.variable(`project_overloaded_${project.id}`);
  await lp.variable(`project_underloaded_${project.id}`);
}

await lp.endVariables();

await lp.startBinaryVariables();

for (const choice of choices) {
  await lp.binaryVariable(`choice_${choice.user_id}_${choice.project_id}`);
}

// TODO FIXME remove this completely as its implied by the project_not_exists
for (const user of users) {
  await lp.binaryVariable(`project_leader_${user.id}`);
}

for (const project of projects) {
  await lp.binaryVariable(`project_not_exists_${project.id}`);
}

await lp.endBinaryVariables();

const results = await lp.calculate();

for (const result of results) {
  console.log(result);
}

/*
for (const result of results
  .filter(([name]) => name.startsWith("choice_"))
  .map(([name, value]) => {
    return [parseInt(name.split("_")[1]), parseInt(name.split("_")[2]), value];
  })) {
  // TODO FIXME optimize
  const choice = choices.find(
    (c) => c.user_id == result[0] && c.project_id == result[1]
  )!;
  if (result[2] == 1) {
    console.log(`${choice.user_id} ${choice.project_id}: ${choice.rank}`);
  }
}*/

await sql.end();