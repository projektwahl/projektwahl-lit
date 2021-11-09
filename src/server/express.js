// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { zod2result } from "../lib/result.js";
import { json, text } from "node:stream/consumers";
import { routes } from "../lib/routes.js";
import { Duplex } from "stream";

/** @type {<P extends keyof routes>(method: string, path: P, handler: (r: import("zod").infer<typeof routes[P]["request"]>) => Promise<[import("http2").OutgoingHttpHeaders, import("zod").infer<typeof routes[P]["response"]>]>) => ((stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) => Promise<boolean>)} */
export function request(method, path, handler) {
  let fn =
    /**
     *
     * @param {import("http2").ServerHttp2Stream} stream
     * @param {import("http2").IncomingHttpHeaders} headers
     */
    async (stream, headers) => {
      try {
        console.log(headers[":method"]+" "+method+" "+path+" "+headers[":path"])
        if (
          headers[":method"] === method &&
          new RegExp(path).test(/** @type {string} */ (headers[":path"]))
        ) {
          console.log("Its a match")

          const body =
          headers[":method"] === "POST"
            ? json(stream)
            : undefined;
          console.log("its the stream that is buggy bruh")

          const requestBody = zod2result(routes[path].request.safeParse(body));

          const [new_headers, responseBody] = await handler(requestBody, stream);
          routes[path].response.parse(responseBody);
          stream.respond(new_headers);
          stream.end(JSON.stringify(responseBody));
      
         

          return true;
        }
      } catch (error) {
        console.error(error)
        stream.respond({":status": "500"}, {endStream: true});
        return true;
      }
      return false;
    };
  return fn;
}
