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
import { sql } from "./database.js";
import { typedSql } from "./describe.js";
import { hashPassword } from "./password.js";

const shuffleArray = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

void (async () => {
  await sql.begin("READ WRITE", async (sql) => {
    const hash = await hashPassword("changeme");

    const admin = (
      await typedSql(sql, {
        types: [1043],
        columns: { id: 23 },
      } as const)`INSERT INTO users_with_deleted (username, password_hash, type) VALUES ('admin', ${hash}, 'admin') ON CONFLICT (username) DO UPDATE SET "group" = "users_with_deleted"."group" RETURNING id;`
    )[0];

    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "testing"
    ) {
      const projects = await typedSql(sql, {
        types: [23],
        columns: {
          id: 23,
          title: 1043,
          info: 1043,
          place: 1043,
          costs: 701,
          min_age: 23,
          max_age: 23,
          min_participants: 23,
          max_participants: 23,
          random_assignments: 16,
          deleted: 16,
          last_updated_by: 23,
        },
      } as const)`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) (SELECT generate_series, '', '', 0, 5, 13, 5, 20, FALSE, ${admin.id} FROM generate_series(1, 100)) RETURNING *;`;

      // take care to set this value to project_count * min_participants <= user_count <= project_count * max_participants
      for (let i = 0; i < 1000; i++) {
        const user = (
          await typedSql(sql, {
            types: [1043, 23],
            columns: { id: 23 },
          } as const)`INSERT INTO users (username, type, "group", age, last_updated_by) VALUES (${`user${Math.random()}`}, 'voter', 'a', 10, ${
            admin.id
          }) ON CONFLICT DO NOTHING RETURNING users.id;`
        )[0];

        shuffleArray(projects);
        for (let j = 0; j < 5 + Math.random() * 3 - 1.5; j++) {
          await typedSql(sql, {
            types: [23, 23, 23],
            columns: {},
          } as const)`INSERT INTO choices (user_id, project_id, rank) VALUES (${
            user.id
          }, ${projects[j]["id"]}, ${j + 1});`;
        }
      }
    }
  });

  await sql.end();
})();
