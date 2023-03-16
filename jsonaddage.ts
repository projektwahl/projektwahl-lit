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
import { readFile } from "node:fs/promises";
import { exit } from "node:process";

if (process.argv.length !== 3) {
  console.log("usage: node jsonaddage.js <file>");
  exit(0);
}


const contents: { group: string }[] = JSON.parse(await readFile(process.argv[2], "utf-8"));

console.log(
  JSON.stringify(
    contents.map((e) => {
      let age;
      const result = [...e.group.matchAll(/^\d+/g)];
      if (result.length == 1) {
        age = Number(result[0]);
      } else if (e.group.startsWith("E0")) {
        age = 11;
      } else if (e.group.startsWith("Q1")) {
        age = 12;
      } else {
        throw new Error(`unknown group ${JSON.stringify(e)}`);
      }
      return {
        age,
        ...e,
      };
    }),
    null,
    2
  )
);
