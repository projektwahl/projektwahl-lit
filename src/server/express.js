// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { zod2result } from "../lib/result.js";
import {
  json, text,
} from 'node:stream/consumers';
import { routes } from "../lib/routes.js";
import { Duplex } from "stream";

/** @type {<P extends keyof routes>(method: string, path: P, handler: (r: import("zod").infer<typeof routes[P]["request"]>) => import("zod").infer<typeof routes[P]["response"]>) => void} */
export function request(method, path, handler) {
  let fn = 
  /**
   * 
   * @param {import("http2").ServerHttp2Stream} stream 
   * @param {import("http2").IncomingHttpHeaders} headers 
   */
  async (stream, headers) => {
    console.log("notgonnahappen")
    if (headers[":method"] === method && new RegExp(path).test(/** @type {string} */ (headers[":path"]))) {
      console.log("yess")
      const webStream = Duplex.toWeb(stream);
      console.log(webStream)
      const body = headers[":method"] === "POST" ? await text(webStream.readable) : undefined;
      console.log("boddy")
      const requestBody = zod2result(routes[path].request.safeParse(body));

      const responseBody = await handler(requestBody);
      console.log("hi")
      routes[path].response.parse(responseBody);
      console.log("jo")

      stream.respond({
        'content-type': 'text/json; charset=utf-8',
        ':status': 200
      });
      stream.end(JSON.stringify(responseBody));
    }
  };
  return fn;
}