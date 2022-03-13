import { sql } from "./database.js";



const query = sql`SELECT * FROM users WHERE id = ${1}`

console.log(await query.describe())
console.log(await query.execute())


await sql.end()