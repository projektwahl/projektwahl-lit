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
import { parse } from "csv-parse";
import { createReadStream } from "node:fs";
import { exit } from "node:process";

if (process.argv.length !== 3) {
  console.log("usage: node csv2json.js <file>");
  exit(0);
}

const parser = createReadStream(process.argv[2]).pipe(
  parse({
    trim: true,
    columns: true,
    delimiter: ",",
    cast: true,
  })
);

const result = [];
for await (const entry of parser) {
  result.push(entry);
}
console.log(JSON.stringify(result, null, 2));
