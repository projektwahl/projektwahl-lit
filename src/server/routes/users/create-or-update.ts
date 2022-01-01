import postgres from "postgres";
import { z } from "zod";
import { sql } from "../../database.js";
import { request } from "../../express.js";
import { hashPassword } from "../../password.js";
import { sql2, unsafe2 } from "../../sql/index.js";

function updateField(entity: any, name: string) {
  return sql2`"${unsafe2(name)}" = CASE WHEN ${
    entity[name] !== undefined
  } THEN ${entity[name] ?? null} ELSE "${unsafe2(name)}" END`;
}

// TODO FIXME somehow ensure all attributes are read here because this is an easy way to loose data
// Also ensure create and update has the same attributes
// TO IMPROVE this maybe return the full column and also read back that data at all places

export async function createOrUpdateUsersHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  // TODO FIXME create or update multiple
  return await request(
    "POST",
    "/api/v1/users/create-or-update",
    async function (user) {
      try {
        const [row] = await sql.begin("READ WRITE", async (sql) => {
          if (user.id) {
            const field = (name: string) => updateField(user, name);
            const finalQuery = sql2`UPDATE users SET
            ${field("username")},
            password_hash = CASE WHEN ${user.password !== undefined} THEN ${
              user.password
                ? ((await hashPassword(user.password)) as any as string)
                : null
            } ELSE password_hash END,
            ${field("type")},
            ${field("group")},
            ${field("age")},
            ${field("away")},
            ${field("project_leader_id")},
            ${field("force_in_project_id")}
            WHERE id = ${user.id} RETURNING id;`;
            return await sql(...finalQuery);
          } else {
            return await sql`INSERT INTO users (username, password_hash, type, "group", age, away, project_leader_id, force_in_project_id) VALUES (${
              user.username ?? null
            }, ${user.password ? await hashPassword(user.password) : null}, ${
              user.type ?? null
            }, ${user.type === "voter" ? user.group ?? null : null}, ${
              user.type === "voter" ? user.age ?? null : null
            }, ${user.away ?? false}, ${
              user.project_leader_id ?? null
            }, ${
              user.force_in_project_id ?? null
            }) RETURNING id;`;
          }
        });

        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            success: true as const,
            data: z.object({ id: z.number() }).parse(row),
          },
        ];
      } catch (error: unknown) {
        if (error instanceof postgres.PostgresError) {
          if (
            error.code === "23505" &&
            error.constraint_name === "users_username_key"
          ) {
            // unique violation
            return [
              {
                "content-type": "text/json; charset=utf-8",
                ":status": 200,
              },
              {
                success: false as const,
                error: {
                  username: "Nutzer mit diesem Namen existiert bereits!",
                },
              },
            ];
          }
        }
        console.error(error);
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 500,
          },
          {
            success: false as const,
            error: {
              unknown: "Interner Fehler!",
            },
          },
        ];
      }
    }
  )(stream, headers);
}
