import postgres from "postgres";
import { sql } from "../../database.js";
import { request } from "../../express.js";

// TODO FIXME you can accidentialy create instead of update if you forget to pass the id. maybe force id and setting it to null means creation.

export async function createOrUpdateProjectsHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http2").IncomingHttpHeaders
) {
  // TODO FIXME create or update multiple
  return await request(
    "POST",
    "/api/v1/projects/create-or-update",
    async function (project, loggedInUser) {
      // helper is allowed to create projects and change their own projects
      // voter is not allowed to do anything

      if (
        !(loggedInUser?.type === "admin" || loggedInUser?.type === "helper")
      ) {
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 403,
          },
          {
            success: false as const,
            error: {
              forbidden: "Insufficient permissions!",
            },
          },
        ];
      }

      try {
        let [row] = await sql.begin("READ WRITE", async (sql) => {
          if (project.id) {
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
    FROM users WHERE projects.id = ${project.id} AND users.id = ${
              loggedInUser.id
            } AND (users.project_leader_id = ${
              project.id
            } AND users.type = 'helper' OR users.type = 'admin') RETURNING projects.id;`;
          } else {
            // TODO FIXME we can use our nice query building here
            // or postgres also has builtin features for insert and update
            let res =
              await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments)
            (SELECT 
    ${project.title ?? null},
    ${project.info ?? null},
    ${project.place ?? null},
    ${project.costs ?? 0},
    ${project.min_age ?? null},
    ${project.max_age ?? null},
    ${project.min_participants ?? null},
    ${project.max_participants ?? null},
    ${project.random_assignments ?? false} FROM users WHERE users.id = ${
                loggedInUser.id
              } AND (users.type = 'helper' OR users.type = 'admin'))
    RETURNING id;`;

            // TODO FIXME make this in sql directly
            if (loggedInUser.type === "helper") {
              await sql`UPDATE users SET project_leader_id = ${
                res[0].id as number
              } WHERE project_leader_id IS NULL AND id = ${loggedInUser.id}`;
            }

            return res;
          }
        });

        if (!row) {
          // insufficient permissions
          return [
            {
              "content-type": "text/json; charset=utf-8",
              ":status": 403,
            },
            {
              success: false as const,
              error: {
                forbidden: "Insufficient permissions!",
              },
            },
          ];
        }
        return [
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          {
            success: true as const,
            data: row,
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
