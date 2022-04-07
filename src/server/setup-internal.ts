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
import { DescriptionTypes, typedSql } from "./describe.js";
import { hashPassword } from "./password.js";
import { Chance } from "chance";

export async function setup() {
  const chance = new Chance(1234);

  await sql.begin("READ WRITE", async (tsql) => {
    await tsql`SELECT set_config('projektwahl.type', 'root', true);`;

    await tsql`INSERT INTO settings (id, election_running) VALUES (1, false) ON CONFLICT DO NOTHING;`;

    const hash = await hashPassword("changeme");

    const admin = (
      await typedSql(tsql, {
        columns: { id: 23 },
      } as const)`INSERT INTO users_with_deleted (username, password_hash, type) VALUES ('admin', ${hash}, 'admin') ON CONFLICT (username) DO UPDATE SET "group" = "users_with_deleted"."group" RETURNING id;`
    )[0];

    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "testing"
    ) {
      let projects: DescriptionTypes<{
        readonly id: 23;
        readonly title: 1043;
        readonly info: 1043;
        readonly place: 1043;
        readonly costs: 701;
        readonly min_age: 23;
        readonly max_age: 23;
        readonly min_participants: 23;
        readonly max_participants: 23;
        readonly random_assignments: 16;
        readonly deleted: 16;
        readonly last_updated_by: 23;
      }>[] = [];
      for (let i = 0; i < 100; i++) {
        const project = (
          await typedSql(tsql, {
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
          } as const)`INSERT INTO projects (title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, last_updated_by) (SELECT ${chance.sentence(
            { punctuation: false, words: 3 }
          )}, ${chance.paragraph()}, ${chance.address()}, ${chance.integer({
            min: 0,
            max: 10,
          })}, ${chance.integer({ min: 5, max: 9 })}, ${chance.integer({
            min: 9,
            max: 13,
          })}, ${chance.integer({ min: 5, max: 10 })}, ${chance.integer({
            min: 10,
            max: 15,
          })}, ${chance.bool({ likelihood: 90 })}, ${admin.id}) RETURNING *;`
        )[0];

        projects.push(project);
      }

      // take care to set this value to project_count * min_participants <= user_count <= project_count * max_participants
      for (let i = 0; i < 500; i++) {
        const user = (
          await typedSql(tsql, {
            columns: { id: 23 },
          } as const)`INSERT INTO users (username, type, "group", age, password_hash, last_updated_by) VALUES (${chance.name(
            { prefix: true, suffix: true }
          )}, ${
            chance.bool() ? "voter" : "helper"
          }, ${chance.profession()}, ${chance.integer({
            min: 5,
            max: 13,
          })}, ${hash}, ${admin.id}) RETURNING users.id;`
        )[0];

        projects = chance.shuffle(projects);
        for (let j = 0; j < chance.integer({ min: 0, max: 25 }); j++) {
          try {
            await tsql.savepoint("test", async (ssql) => {
              await typedSql(ssql, {
                columns: {},
              } as const)`INSERT INTO choices (user_id, project_id, rank) VALUES (${
                user.id
              }, ${projects[j]["id"]}, ${j + 1});`;
            });
          } catch (error) {
            // ignore
          }
        }
      }
    }
  });
}
