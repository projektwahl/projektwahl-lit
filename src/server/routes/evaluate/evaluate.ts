import { sql } from "../../database.js";
import { evaluate } from "./index.js";

await sql.begin(async (tsql) => {
  await evaluate(tsql, false); // TODO change to true for assignment
});

await sql.end();
