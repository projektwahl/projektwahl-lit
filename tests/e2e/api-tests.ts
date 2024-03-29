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

const chance: Chance.Chance = new Chance(/*1234*/);

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
  assert.deepEqual(r, "No CSRF header!");

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "wrong",
    },
    "null"
  );
  assert.deepEqual(r, "No CSRF header!");

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
          message: 'SyntaxError: "undefined" is not valid JSON',
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

async function getAdminSessionId() {
  const [r, headers] = await request(
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
  return session_id;
}

async function getVoterSessionId() {
  const [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/login`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "Dr. Dustin Allison M.D.",
      password: "changeme",
    })
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });
  const session_id = (headers["set-cookie"] || "")[0]
    .split(";")[0]
    .split("=")[1];
  return session_id;
}

async function testLogout() {
  let r;

  [r] = await request(
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

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/logout`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  const session_id = await getAdminSessionId();

  [r] = await request(
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

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/logout`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  [r] = await request(
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

async function testCreateOrUpdateUsers() {
  let r;

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([])
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

  const session_id = await getAdminSessionId();

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([])
  );
  assert.deepEqual(JSON.parse(r), { success: true });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([{}])
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_union_discriminator",
          options: ["create", "update"],
          path: [0, "action"],
          message:
            "Ungültiger Unterscheidungswert. Erwarte 'create' | 'update'",
        },
      ],
      name: "ZodError",
    },
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "create",
      },
    ])
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          expected: "'voter' | 'helper' | 'admin'",
          received: "undefined",
          code: "invalid_type",
          path: [0, "type"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: [0, "username"],
          message: "Pflichtfeld",
        },
      ],
      name: "ZodError",
    },
  });

  const old_username = chance.name();
  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "create",
        type: "admin",
        username: old_username,
      },
    ])
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let value = JSON.parse(r);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const id: number = value.data[0].id;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  value.data[0].id = 1337;
  assert.deepEqual(value, {
    success: true,
    data: [{ id: 1337, project_leader_id: null, force_in_project_id: null }],
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "update",
      },
    ])
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  value = JSON.parse(r);
  assert.deepEqual(value, {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: [0, "id"],
          message: "Pflichtfeld",
        },
      ],
      name: "ZodError",
    },
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "update",
        id,
      },
    ])
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  value = JSON.parse(r);
  assert.deepEqual(value, {
    success: true,
    data: [{ id, project_leader_id: null, force_in_project_id: null }],
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users?${encodeURIComponent(
        JSON.stringify({
          filters: {
            id,
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
  value = JSON.parse(r);
  assert.deepEqual(value, {
    success: true,
    data: {
      entities: [
        {
          id,
          type: "admin",
          username: old_username,
          openid_id: null,
          group: null,
          age: null,
          away: false,
          project_leader_id: null,
          force_in_project_id: null,
          computed_in_project_id: null,
          deleted: false,
          valid: "neutral",
          voted_choices: null,
        },
      ],
      nextCursor: null,
      previousCursor: null,
    },
  });

  const new_username = chance.name();
  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users/create-or-update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "update",
        id,
        username: new_username,
      },
    ])
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  value = JSON.parse(r);
  assert.deepEqual(value, {
    success: true,
    data: [{ id, project_leader_id: null, force_in_project_id: null }],
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/users?${encodeURIComponent(
        JSON.stringify({
          filters: {
            id,
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
  value = JSON.parse(r);
  assert.deepEqual(value, {
    success: true,
    data: {
      entities: [
        {
          id,
          type: "admin",
          username: new_username,
          openid_id: null,
          group: null,
          age: null,
          away: false,
          project_leader_id: null,
          force_in_project_id: null,
          computed_in_project_id: null,
          deleted: false,
          valid: "neutral",
          voted_choices: null,
        },
      ],
      nextCursor: null,
      previousCursor: null,
    },
  });
}

async function testCreateOrUpdateProjects() {
  let r;

  const session_id = await getAdminSessionId();

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/projects/create`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["costs"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "boolean",
          received: "undefined",
          path: ["deleted"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["info"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["max_age"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["max_participants"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["min_age"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["min_participants"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["place"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "boolean",
          received: "undefined",
          path: ["random_assignments"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["title"],
          message: "Pflichtfeld",
        },
      ],
      name: "ZodError",
    },
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/projects/create`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      title: "hi",
      costs: 0,
      deleted: false,
      info: "",
      min_age: 5,
      max_age: 13,
      min_participants: 5,
      max_participants: 15,
      place: "jo",
      random_assignments: false,
    })
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = JSON.parse(r);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const id: number = data.data.id;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  data.data.id = 1337;
  assert.deepEqual(data, { success: true, data: { id: 1337 } });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/projects?${encodeURIComponent(
        JSON.stringify({
          filters: {
            id,
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
  const value = JSON.parse(r);
  assert.deepEqual(value, {
    success: true,
    data: {
      entities: [
        {
          id,
          title: "hi",
          info: "",
          place: "jo",
          costs: 0,
          min_age: 5,
          max_age: 13,
          min_participants: 5,
          max_participants: 15,
          random_assignments: false,
          deleted: false,
          project_leaders: [],
          computed_in_projects: [],
        },
      ],
      nextCursor: null,
      previousCursor: null,
    },
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/projects/update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      id,
      title: "bruh",
    })
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: { id } });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/projects?${encodeURIComponent(
        JSON.stringify({
          filters: {
            id,
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
    success: true,
    data: {
      entities: [
        {
          id,
          title: "bruh",
          info: "",
          place: "jo",
          costs: 0,
          min_age: 5,
          max_age: 13,
          min_participants: 5,
          max_participants: 15,
          random_assignments: false,
          deleted: false,
          project_leaders: [],
          computed_in_projects: [],
        },
      ],
      nextCursor: null,
      previousCursor: null,
    },
  });
}

async function testChoices() {
  let r;

  const session_id = await getVoterSessionId();

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/choices/update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["project_id"],
          message: "Pflichtfeld",
        },
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["rank"],
          message: "Pflichtfeld",
        },
      ],
      name: "ZodError",
    },
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/choices/update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      project_id: 42,
      rank: 1,
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["database"],
          message:
            "Der Nutzer passt nicht in die Altersbegrenzung des Projekts!",
        },
      ],
    },
  });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/choices/update`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      project_id: 1,
      rank: 1,
    })
  );
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/choices?${encodeURIComponent(
        JSON.stringify({
          filters: {
            title: "Tu asojag aza",
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
    success: true,
    data: {
      entities: [
        {
          id: 1,
          title: "Tu asojag aza",
          info: "Pikot ranab igwocuj mol atesi nutfinoj ot ibagob onumagmes dansab kul ujdowzo. Guab gudo won ga cu umbuhnup roffaw elonidsa obri jufgozu awfuwza haw kafnewipe paidowow. Seodke cibko epna zugedi mu sinve odaegu vejazat bujmil wuz muccip ikbik komeb lerotpom ekwiw. Konuj idi wid lodi obuiwmul wibnehku zu vipla madu saokule lifhok hozueja. Suib biza aceuc daz keunian vabcocapu hatejoval nozrimub fulwok mo gon dipa wutehfo izu. Inav duaz enro fe ufzo la rajom pujevi vesul awa lacem puda uk ipgul ziozpof megzo. Rulbanuk osnomej tuvaju hed paakne et salpufo gehucu izcuceb zueliize zo zag sa kuomwih.",
          place: "335 Uwoege Turnpike",
          costs: 10,
          min_age: 9,
          max_age: 12,
          min_participants: 9,
          max_participants: 12,
          random_assignments: false,
          deleted: false,
          rank: 1,
          project_id: 1,
          user_id: 2,
        },
      ],
      nextCursor: null,
      previousCursor: null,
    },
  });
}

async function testSudo() {
  const session_id = await getAdminSessionId();

  let headers;

  let [r] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/sudo`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "invalid_type",
          expected: "number",
          received: "undefined",
          path: ["id"],
          message: "Pflichtfeld",
        },
      ],
      name: "ZodError",
    },
  });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/sudo`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      id: 2,
    })
  );
  const sudo_session_id = (headers["set-cookie"] || "")[0]
    .split(";")[0]
    .split("=")[1];
  assert.deepEqual(JSON.parse(r), { success: true, data: {} });

  [r, headers] = await request(
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_PATH]: `/api/v1/sudo`,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${sudo_session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      id: 2,
    })
  );
  assert.deepEqual(JSON.parse(r), {
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          path: ["forbidden"],
          message: "Unzureichende Berechtigung!",
        },
      ],
    },
  });
}

await testSudo();

await testChoices();

await testCreateOrUpdateProjects();

await testCreateOrUpdateUsers();

await testLogin();

await sleep(5000);

await testLogout();
