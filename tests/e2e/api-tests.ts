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
import assert from "assert/strict";
import { Chance } from "chance";
import {
  connect,
  constants,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
  OutgoingHttpHeaders,
} from "node:http2";

let chance: Chance.Chance;

chance = new Chance(1234);

if (!process.env["BASE_URL"]) {
  console.error("BASE_URL not set!");
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL;

function request(requestHeaders: OutgoingHttpHeaders, requestBody: string) {
  return new Promise((resolve, reject) => {
    const client = connect(BASE_URL, {
      rejectUnauthorized: false,
    });
    client.on("error", (err) => reject(err));

    const buffer = Buffer.from(requestBody);

    const req = client.request({
      [constants.HTTP2_HEADER_SCHEME]: "https",
      "Content-Type": "application/json",
      "Content-Length": buffer.length,
      ...requestHeaders,
    });

    let responseHeaders: IncomingHttpHeaders & IncomingHttpStatusHeader;
    req.on("response", (headers) => {
      responseHeaders = headers;
    });

    req.setEncoding("utf8");
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      client.close();

      resolve([responseHeaders, JSON.parse(data)]);
    });

    req.write(buffer);
    req.end();
  });
}

async function testLogin() {
  const r = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
    },
    "null"
  );
  console.log(r);
}

chance.integer();

assert.ok(true);

await testLogin();
