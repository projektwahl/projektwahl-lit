import postgres, { TransactionSql } from "postgres";

if (!process.env["DATABASE_URL"]) {
  console.error("DATABASE_URL not set!");
  process.exit(1);
}

export const sql = postgres(process.env["DATABASE_URL"], {
  debug: (conn, query, params) => {
    console.log(query, params);
  },
});

type UnwrapPromiseArray<T> = T extends any[] ? {
  [k in keyof T]: T[k] extends Promise<infer R> ? R : T[k]
} : T;

export async function retryableBegin<T>(options: string, cb: (tsql: TransactionSql<{}>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>> {
  while (true) {
    try {
      return await sql.begin(options, cb)
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "40001") {
        console.log("SERIALIZATION FAILURE - RETRYING")
      } else {
        throw error
      }
    }
  }
}