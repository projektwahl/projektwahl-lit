import { sql } from "../../database.js";
import { evaluate } from "./index.js";

await sql.begin(async (tsql) => {
    await evaluate(tsql)
})

await sql.end()