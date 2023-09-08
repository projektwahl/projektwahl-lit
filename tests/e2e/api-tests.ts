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
import { z } from "zod";
import { routes } from "../../src/lib/routes.js";

const chance: Chance.Chance = new Chance(/*1234*/);

if (!process.env.BASE_URL) {
  console.error("BASE_URL not set!");
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL;

function request<U extends keyof typeof routes>(
  url: U,
  params: string | null,
  requestHeaders: OutgoingHttpHeaders,
  requestBody: string | null
): Promise<[z.infer<typeof routes[U]["response"]>, IncomingHttpHeaders & IncomingHttpStatusHeader]> {
  return new Promise((resolve, reject) => {
    const client = connect(BASE_URL, {
      rejectUnauthorized: false,
    });
    client.on("error", (err) => { reject(err); });

    const buffer = requestBody !== null ? Buffer.from(requestBody) : null;

    const req = client.request({
      [constants.HTTP2_HEADER_SCHEME]: "https",
      [constants.HTTP2_HEADER_PATH]: params ? `${url}?${params}` : url,
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
      
      resolve([routes[url].response.parse(JSON.parse(data)), responseHeaders]);
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
    },
    null
  );
  assert.deepEqual(headers[constants.HTTP2_HEADER_STATUS], 400);
  assert.deepEqual(r, "");

  [r, headers] = await request(
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
    },
    "null"
  );
  assert.deepEqual(r, "No CSRF header!");

  [r, headers] = await request(
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "wrong",
    },
    "null"
  );
  assert.deepEqual(r, "No CSRF header!");

  [r, headers] = await request(
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    "null"
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    "undefined"
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    ""
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    "{}"
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      usernamee: "hi",
      password: "jo",
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "hi",
      password: "jo",
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "jo",
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "jo",
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "changeme",
    })
  );
  assert.deepEqual(r, { success: true, data: {} });

  [r, headers] = await request(
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "jo",
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "admin",
      password: "changeme",
    })
  );
  assert.deepEqual(r, { success: true, data: {} });
  const session_id = (headers["set-cookie"] || "")[0]
    .split(";")[0]
    .split("=")[1];
  return session_id;
}

async function getVoterSessionId() {
  const [r, headers] = await request(
    `/api/v1/login`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      username: "Dr. Dustin Allison M.D.",
      password: "changeme",
    })
  );
  assert.deepEqual(r, { success: true, data: {} });
  const session_id = (headers["set-cookie"] || "")[0]
    .split(";")[0]
    .split("=")[1];
  return session_id;
}

async function testLogout() {
  let r;

  [r] = await request(
    `/api/v1/logout`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      anything: 1,
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/logout`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(r, { success: true, data: {} });

  const session_id = await getAdminSessionId();

  [r] = await request(
    `/api/v1/sessions`,
    encodeURIComponent(
      JSON.stringify({
        filters: {
          user_id: null,
        },
        sorting: [],
      })
    ),
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  
  const parsed = z.object({ success: z.boolean() }).parse(r);
  assert.equal(parsed.success, true);

  [r] = await request(
    `/api/v1/logout`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(r, { success: true, data: {} });

  [r] = await request(
    `/api/v1/sessions`,
    encodeURIComponent(
      JSON.stringify({
        filters: {
          user_id: null,
        },
        sorting: [],
      })
    ),
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  assert.deepEqual(r, {
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

  let [r] = await request(
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([])
  );
  assert.deepEqual(r, {
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
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([])
  );
  assert.deepEqual(r, { success: true });

  [r] = await request(
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([{}])
  );
  assert.deepEqual(r, {
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
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "create",
      },
    ])
  );
  assert.deepEqual(r, {
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
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
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
  
  const id: number = r[0].id;
  
  r[0].id = 1337;
  assert.deepEqual(r, {
    success: true,
    data: [{ id: 1337, project_leader_id: null, force_in_project_id: null }],
  });

  [r] = await request(
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify([
      {
        action: "update",
      },
    ])
  );
  
  assert.deepEqual(r, {
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
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
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
  
  assert.deepEqual(r, {
    success: true,
    data: [{ id, project_leader_id: null, force_in_project_id: null }],
  });

  {
    const [r] = await request(
      `/api/v1/users`,
      encodeURIComponent(
        JSON.stringify({
          filters: {
            id,
          },
          sorting: [],
        })
      ),
      {
        [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
        [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
        "x-csrf-protection": "projektwahl",
      },
      null
    );
    
    assert.deepEqual(r, {
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
  }

  const new_username = chance.name();
  [r] = await request(
    `/api/v1/users/create-or-update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
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
  
  assert.deepEqual(r, {
    success: true,
    data: [{ id, project_leader_id: null, force_in_project_id: null }],
  });

  {
    const [r] = await request(
      `/api/v1/users`,
      encodeURIComponent(
        JSON.stringify({
          filters: {
            id,
          },
          sorting: [],
        })
      ),
      {
        [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
        [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
        "x-csrf-protection": "projektwahl",
      },
      null
    );
    
    assert.deepEqual(r, {
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
}

async function testCreateOrUpdateProjects() {
  let r;

  const session_id = await getAdminSessionId();

  [r] = await request(
    `/api/v1/projects/create`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(r, {
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
    `/api/v1/projects/create`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
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
    
  const id: number = r.id;
  
  r.id = 1337;
  assert.deepEqual(r, { success: true, data: { id: 1337 } });

  [r] = await request(
    `/api/v1/projects`,
    encodeURIComponent(
      JSON.stringify({
        filters: {
          id,
        },
        sorting: [],
      })
    ),
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  
  const value = r;
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
    `/api/v1/projects/update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      id,
      title: "bruh",
    })
  );
  assert.deepEqual(r, { success: true, data: { id } });

  [r] = await request(
    `/api/v1/projects`,
    encodeURIComponent(
      JSON.stringify({
        filters: {
          id,
        },
        sorting: [],
      })
    ),
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  assert.deepEqual(r, {
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
    `/api/v1/choices/update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(r, {
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
    `/api/v1/choices/update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      project_id: 42,
      rank: 1,
    })
  );
  assert.deepEqual(r, {
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
    `/api/v1/choices/update`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      project_id: 1,
      rank: 1,
    })
  );
  assert.deepEqual(r, { success: true, data: {} });

  [r] = await request(
    `/api/v1/choices`,
    encodeURIComponent(
      JSON.stringify({
        filters: {
          title: "Tu asojag aza",
        },
        sorting: [],
      })
    ),
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_GET,
      [constants.HTTP2_HEADER_COOKIE]: `lax_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    null
  );
  assert.deepEqual(r, {
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
    `/api/v1/sudo`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({})
  );
  assert.deepEqual(r, {
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
    `/api/v1/sudo`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
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
  assert.deepEqual(r, { success: true, data: {} });

  [r, headers] = await request(
    `/api/v1/sudo`,
    null,
    {
      [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
      [constants.HTTP2_HEADER_COOKIE]: `strict_id=${sudo_session_id}`,
      "x-csrf-protection": "projektwahl",
    },
    JSON.stringify({
      id: 2,
    })
  );
  assert.deepEqual(r, {
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
