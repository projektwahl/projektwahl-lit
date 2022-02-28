import { FileHandle, mkdtemp, open, readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { sql } from "../../database.js";

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
    await this.fileHandle.write(`Maximize:\n obj: test 0`);
  };

  maximize = async (factor: number, variable: string) => {
    await this.fileHandle.write(` + ${factor} ${variable}`);
  };

  endMaximize = async () => {};

  startContraints = async () => {};

  startConstraint = async (name: string, min: number, max: number) => {};

  endConstraint = async () => {};

  endConstraints = async () => {};

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
  lp.maximize(rank2points(choice.rank), `choice_${choice.user_id}_${choice.project_id}`);
}


await lp.endMaximize()





await lp.startVariables()

lp.variable(`test`);

for (const choice of choices) {
    lp.variable(`choice_${choice.user_id}_${choice.project_id}`);
}

await lp.endVariables()

await lp.calculate();
