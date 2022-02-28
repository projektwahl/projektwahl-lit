import { FileHandle, mkdtemp, open, readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { sql } from "../../database.js";
import groupBy from "lodash-es/groupBy.js";

export class CPLEXLP {
  constructor() {}

  filePath!: string;
  fileHandle!: FileHandle;

  setup = async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "projektwahl-"));
    this.filePath = path.join(dir, "cplex.lp");
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
      await this.fileHandle.write(` + ${factor} ${variable}`);
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
        await this.fileHandle.write(` + ${constraint[0]} ${constraint[1]}`);
      }
      await this.fileHandle.write(` >= ${min}`);
    }
    if (max !== null) {
      await this.fileHandle.write(`\nmax_${name}: `);
      for (const constraint of constraints) {
        await this.fileHandle.write(` + ${constraint[0]} ${constraint[1]}`);
      }
      await this.fileHandle.write(` <= ${max}`);
    }
  };

  endConstraints = async () => {};

  startVariables = async () => {
    await this.fileHandle.write(`\nGeneral\n`);
  };

  variable = async (name: string) => {
    await this.fileHandle.write(` ${name}`);
  };

  endVariables = async () => {
    await this.fileHandle.write(`\nEnd\n`);
  };

  calculate = async () => {
    await this.fileHandle.close();

    console.log(this.filePath);

    const childProcess = execFile("glpsol", ["--lp", this.filePath], {});

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

    console.log(exitCode);
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

console.log(choices);

await lp.startMaximize();

for (const choice of choices) {
  await lp.maximize(
    rank2points(choice.rank),
    `choice_${choice.user_id}_${choice.project_id}`
  );
}

await lp.endMaximize();

await lp.startConstraints();

for (const choice of choices) {
  await lp.constraint(`choice_${choice.user_id}_${choice.project_id}`, 0, [[1, `choice_${choice.user_id}_${choice.project_id}`]], 1);
}

for (const groupedChoice of Object.entries(
  groupBy(choices, (c) => c.user_id)
)) {
  await lp.constraint(
    `min_only_in_one_project${groupedChoice[0]}`,
    0,
    groupedChoice[1].map((choice) => [
      1,
      `choice_${choice.user_id}_${choice.project_id}`,
    ]),
    1
  );
}

await lp.startVariables();

for (const choice of choices) {
  await lp.variable(`choice_${choice.user_id}_${choice.project_id}`);
}

await lp.endVariables();

await lp.calculate();
