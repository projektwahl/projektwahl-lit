import postgres from "postgres";

if (!process.env['DATABASE_URL']) {
  console.error("DATABASE_URL not set!")
  process.exit(1);
}

export const sql = postgres(process.env['DATABASE_URL'], {
  debug: (conn, query, params) => {
    console.log(query, params);
  },
});
