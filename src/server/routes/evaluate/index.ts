import { mkdtemp, open } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { constants } from "node:fs";

export class CPLEXLP {
  constructor() {}

  setup = async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "projektwahl-"));
    const filePath = path.join(dir, "data.dat");
    const fileHandle = await open(
      filePath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
      0o600
    );
  };

  startMaximize = () => {};

  maximize = (factor: number, variable: string) => {};

  endMaximize = () => {};

  startContraints = () => {};

  startConstraint = (name: string, min: number, max: number) => {};

  endConstraint = () => {};

  endConstraints = () => {};

  startVariables = () => {};

  endVariables = () => {};
}
