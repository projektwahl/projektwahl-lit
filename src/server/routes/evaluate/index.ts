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

  startConstraint = async (name: string) => {
    await this.fileHandle.write(`\n${name}: `);
  };

  constraint = async (factor: number, variable: string) => {
    await this.fileHandle.write(` + ${factor} ${variable}`);
  }

  endConstraint = async (indicator: "<"|"<="|"=<"|">"|">="|"=>"|"=", value: number) => {
    await this.fileHandle.write(` ${indicator} ${value}`);
  };

  endConstraints = async () => {

  };

  startVariables = async () => {
    await this.fileHandle.write(`\nGeneral\n`);
  };

  variable = async (name: string) => {
    await this.fileHandle.write(` ${name}`);
  }

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
  await lp.maximize(rank2points(choice.rank), `choice_${choice.user_id}_${choice.project_id}`);
}


await lp.endMaximize()



await lp.startConstraints()

for (const choice of choices) {
    await lp.startConstraint(`min_choice_${choice.user_id}_${choice.project_id}`)
    await lp.constraint(1, `choice_${choice.user_id}_${choice.project_id}`);
    await lp.endConstraint(">=", 0)

    await lp.startConstraint(`max_choice_${choice.user_id}_${choice.project_id}`)
    await lp.constraint(1, `choice_${choice.user_id}_${choice.project_id}`);
    await lp.endConstraint("<=", 1)
}

for (const groupedChoice of Object.entries(groupBy(choices, (c) => c.user_id))) {
    await lp.startConstraint(`Min_only_in_one_project${groupedChoice[0]}`)
    for (const choice of groupedChoice[1]) {
        await lp.constraint(1, `choice_${choice.user_id}_${choice.project_id}`);
    }
    await lp.endConstraint(">=", 0)
}

// TODO FIXME remove duplication of >= and <=
for (const groupedChoice of Object.entries(groupBy(choices, (c) => c.user_id))) {
    await lp.startConstraint(`max_only_in_one_project${groupedChoice[0]}`)
    for (const choice of groupedChoice[1]) {
        await lp.constraint(1, `choice_${choice.user_id}_${choice.project_id}`);
    }
    await lp.endConstraint("<=", 1)
}

await lp.startVariables()

for (const choice of choices) {
    await lp.variable(`choice_${choice.user_id}_${choice.project_id}`);
}

await lp.endVariables()

await lp.calculate();
