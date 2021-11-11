import postgres from "postgres";

export const sql = postgres({
  debug: (conn, query, params) => {
    console.log(query, params)
  },
  database: "projektwahl",
  user: "projektwahl",
  password: "projektwahl",
  host: "projektwahl",
});
