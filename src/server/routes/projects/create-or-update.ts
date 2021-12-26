import { sql } from "../../database.js";
import { request } from "../../express.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function createProjectsHandler(stream, headers) {
  // TODO FIXME create or update multiple
  return await request(
    "POST",
    "/api/v1/projects/create",
    async function (project) {
      try {
        let [row] = await sql.begin("READ WRITE", async (sql) => {
          if (project.id !== undefined) {
            return await sql`UPDATE projects SET
    title = CASE WHEN ${project.title !== undefined} THEN ${
              project.title ?? null
            } ELSE title END,
    info = CASE WHEN ${project.info !== undefined} THEN ${
              project.info ?? null
            } ELSE info END,
    place = CASE WHEN ${project.place !== undefined} THEN ${
              project.place ?? null
            } ELSE place END,
    costs = CASE WHEN ${project.costs !== undefined} THEN ${
              project.costs ?? null
            } ELSE costs END,
    min_age = CASE WHEN ${project.min_age !== undefined} THEN ${
              project.min_age ?? null
            } ELSE min_age END,
    max_age = CASE WHEN ${project.max_age !== undefined} THEN ${
              project.max_age ?? null
            } ELSE max_age END,
    min_participants = CASE WHEN ${
      project.min_participants !== undefined
    } THEN ${project.min_participants ?? null} ELSE max_participants END,
    max_participants = CASE WHEN ${
      project.max_participants !== undefined
    } THEN ${project.max_participants ?? null} ELSE max_participants END,
    random_assignments = CASE WHEN ${
      project.random_assignments !== undefined
    } THEN ${project.random_assignments ?? null} ELSE random_assignments END
    WHERE id = ${project.id} RETURNING id;`;
          } else {
            // TODO FIXME we can use our nice query building here
            // or postgres also has builtin features for insert and update
            return await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments) VALUES
    (${project.title ?? null},
    ${project.info ?? null},
    ${project.place ?? null},
    ${project.costs ?? 0},
    ${project.min_age ?? null},
    ${project.max_age ?? null},
    ${project.min_participants ?? null},
    ${project.max_participants ?? null},
    ${project.random_assignments ?? false})
    RETURNING id;`;
          }
        });

        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            result: "success",
            success: row,
          },
        ];
      } catch (/** @type {unknown} */ error) {
        if (error instanceof Error && error.name === "PostgresError") {
          const postgresError = /** @type {PostgresError} */ error;
          if (
            postgresError.code === "23505" &&
            postgresError.constraint_name === "users_username_key"
          ) {
            // unique violation
            return [
              {
                "content-type": "text/json; charset=utf-8",
                ":status": 200,
              },
              {
                result: "failure",
                failure: {
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
            result: "failure",
            failure: {
              unknown: "Interner Fehler!",
            },
          },
        ];
      }
    }
  )(stream, headers);
}
