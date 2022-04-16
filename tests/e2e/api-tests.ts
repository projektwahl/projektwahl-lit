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
import { sleep } from "../../src/client/utils.js";

const chance: Chance.Chance = new Chance(1234);

if (!process.env["BASE_URL"]) {
  console.error("BASE_URL not set!");
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL;

function request(
  requestHeaders: OutgoingHttpHeaders,
  requestBody: string | null
): Promise<[string, IncomingHttpHeaders & IncomingHttpStatusHeader]> {
  return new Promise((resolve, reject) => {
    const client = connect(BASE_URL, {
      rejectUnauthorized: false,
    });
    client.on("error", (err) => reject(err));

    const buffer = requestBody !== null ? Buffer.from(requestBody) : null;

    const req = client.request({
      [constants.HTTP2_HEADER_SCHEME]: "https",
      ...requestHeaders,
      ...(buffer !== null
        ? {
            "Content-Type": "application/json",
            "Content-Length": buffer.length,
          }
        : {}),
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

      resolve([data, responseHeaders]);
    });

    if (buffer) {
      req.write(buffer);
    }
    req.end();
  });
}

async function testLogin() {
  let r, headers;

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
    },
    null
  );
  assert.deepEqual(headers[constants.HTTP2_HEADER_STATUS], 400);
  assert.deepEqual(r, "");

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
    },
    "null"
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["internal_error"],
          message: "Error: No CSRF header!",
        },
      ],
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "wrong",
    },
    "null"
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["internal_error"],
          message: "Error: No CSRF header!",
        },
      ],
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    "null"
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "object",
          received: "null",
          path: [],
          message: "Erwarte object, aber null bekommen",
        },
      ],
      name: "ZodError",
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    "undefined"
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["internal_error"],
          message: "SyntaxError: Unexpected token u in JSON at position 0",
        },
      ],
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    ""
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["internal_error"],
          message: "SyntaxError: Unexpected end of JSON input",
        },
      ],
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    "{}"
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["username"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["password"],
          message: "Pflichtfeld",
        },
      ],
      name: "ZodError",
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      usernamee: "hi",
      password: "jo",
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["username"],
          message: "Pflichtfeld",
        },
        {
          code: "unrecognized_keys",
          keys: ["usernamee"],
          path: [],
          message: "Unbekannte Schlüssel: 'usernamee'",
        },
      ],
      name: "ZodError",
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "hi",
      password: "jo",
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["username"],
          message: "Nutzer existiert nicht!",
        },
      ],
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "jo",
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["password"],
          message: "Falsches Passwort!",
        },
      ],
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "jo",
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["login"],
          message:
            "Zu viele Anmeldeversuche in zu kurzer Zeit. Warte einen Moment.",
        },
      ],
    },
  });

  await sleep(5000);

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "changeme",
    })
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "jo",
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["password"],
          message: "Falsches Passwort!",
        },
      ],
    },
  });
}

async function testLogout() {
  let r, headers;

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/logout`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      anything: 1,
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "unrecognized_keys",
          keys: ["anything"],
          path: [],
          message: "Unbekannte Schlüssel: 'anything'",
        },
      ],
      name: "ZodError",
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/logout`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "changeme",
    })
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });
  const session_id = (headers["set-cookie"] || "")[0]
    .split(";")[0]
    .split("=")[1];

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/sessions?${encodeURIComponent(
        JSON.stringify({
          filters: {
            user_id: null,
          },
          sorting: [],
        })
      )}`,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsed: { success: unknown } = JSON.parse(r);
  assert.equal(parsed.success, true);

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/logout`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/sessions?${encodeURIComponent(
        JSON.stringify({
          filters: {
            user_id: null,
          },
          sorting: [],
        })
      )}`,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["unauthorized"],
          message: "Nicht angemeldet! Klicke rechts oben auf Anmelden.",
        },
      ],
    },
  });
}

chance.integer();

await testLogin();

await sleep(5000);

await testLogout();
