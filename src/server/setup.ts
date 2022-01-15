/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { z } from "zod";
import { rawProjectSchema, rawUserSchema } from "../lib/routes.js";
import { sql } from "./database.js";
import { hashPassword } from "./password.js";

const shuffleArray = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

await sql.begin("READ WRITE", async (sql) => {
  const hash = await hashPassword("changeme");

  const admin = rawUserSchema
    .pick({
      id: true,
    })
    .parse(
      (
        await sql`INSERT INTO users_with_deleted (username, password_hash, type) VALUES ('admin', ${hash}, 'admin') ON CONFLICT (username) DO UPDATE SET "group" = "users_with_deleted"."group" RETURNING id;`
      )[0]
    );

  const projects = z
    .array(rawProjectSchema)
    .parse(
      await sql`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) (SELECT generate_series, '', '', 0, 5, 13, 5, 20, FALSE, ${admin.id} FROM generate_series(1, 10)) RETURNING *;`
    );

  console.log(projects);

  // take care to set this value to project_count * min_participants <= user_count <= project_count * max_participants
  for (let i = 0; i < 100; i++) {
    // TODO FIXME add user to keycloak / import users from keycloak (probably easier)
    // https://www.keycloak.org/documentation
    // https://www.keycloak.org/docs-api/15.0/rest-api/index.html

    // TODO compare our approach in general with https://github.com/keycloak/keycloak-quickstarts

    // https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/admin-cli.adoc

    // INTERESTING https://www.keycloak.org/docs/latest/server_admin/index.html#automatically-link-existing-first-login-flow
    // https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/identity-broker/first-login-flow.adoc

    // https://www.keycloak.org/docs-api/15.0/rest-api/index.html

    // TODO we could use that admin URL
    // Remove all user sessions associated with the user Also send notification to all clients that have an admin URL to invalidate the sessions for the particular user.
    /*
		const response = await myFetch(process.env['OPENID_ADMIN_URL']!, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env['PROJEKTWAHL_ADMIN_ACCESS_TOKEN']}`
			},
			redirect: 'manual',
			body: JSON.stringify({
				username: `user${Math.random()}`,
				//email: `user${i}@example.org`,
				enabled: true
			})
		});
		console.log(await response.text());
		console.log(response.headers);
		console.log(response.headers.get('location'));
		const userResponse = await myFetch(response.headers.get('location')!, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env['PROJEKTWAHL_ADMIN_ACCESS_TOKEN']}`
			}
		});
		const keycloakUser = await userResponse.json();
		console.log(keycloakUser)^;
		*/

    const user = rawUserSchema
      .pick({
        id: true,
      })
      .parse(
        (
          await sql`INSERT INTO users (username, type, "group", age, last_updated_by) VALUES (${`user${Math.random()}`}, 'voter', 'a', 10, ${
            admin.id
          }) ON CONFLICT DO NOTHING RETURNING users.id;`
        )[0]
      );
    shuffleArray(projects);
    for (let j = 0; j < 5; j++) {
      // TODO FIXME generate users who voted incorrectly (maybe increase/decrease iterations)
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await sql`INSERT INTO choices (user_id, project_id, rank) VALUES (${
        user.id
      }, ${projects[j]["id"]}, ${j + 1});`;
    }
  }
});

await sql.end();
