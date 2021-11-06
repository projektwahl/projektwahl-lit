// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { zod2result } from "projektwahl-lit-lib/src/result.js";
import {  } from "projektwahl-lit-lib/src/routes.js";
import {
  json,
} from 'node:stream/consumers';

/** @type {<P extends keyof import("projektwahl-lit-lib/src/routes").routes>(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders, path: P) => void} */
export async function post(stream, headers, path) {
  if (headers[":method"] === "GET" && new RegExp(path).test(/** @type {string} */ (headers[":path"]))) {
    const body = await json(stream.toWeb())

    // TODO FIXME
    const loginRequest = zod2result(loginInputSchema.safeParse(body));

    stream.respond({
      'content-type': 'text/html; charset=utf-8',
      ':status': 200
    });
    stream.end('<h1>Hello World</h1>');
  }
}

/** @type {<P extends keyof import("projektwahl-lit-lib/src/route-types").Routes>(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders, path: P, handler: () => import("projektwahl-lit-lib/src/routes").Routes[P]) => void} */
export async function get(stream, headers, path, handler) {
  if (headers[":method"] === "POST" && new RegExp(path).test(/** @type {string} */ (headers[":path"]))) {
    stream.respond({
      'content-type': 'text/json; charset=utf-8',
      ':status': 200
    });
    stream.end('<h1>Hello World</h1>');
  }
}
