import postgres from "postgres"

export const sql = postgres("postgres://moritz@localhost/moritz", {
  host: "/run/postgresql"
})

await Promise.all(Array.from({length: 12}, () => sql.begin(async (tsql) => await tsql`SELECT 1`)))

await sql.end()