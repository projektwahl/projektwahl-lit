// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { zod2result } from "../lib/result.js";
import { json } from "node:stream/consumers";
import { routes } from "../lib/routes.js";
import { URL } from "url";

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
        let url = new URL(headers[":path"], "https://localhost:8443");
        if (
          headers[":method"] === method &&
          new RegExp(path).test(/** @type {string} */ (url.pathname))
        ) {
          const body =
            headers[":method"] === "POST" ? await json(stream) : undefined;

          const parsed = routes[path].request.safeParse(body);
          console.log(parsed)
          const requestBody = zod2result(parsed);
          if (requestBody.result == "success") {
            const [new_headers, responseBody] = await handler(
              requestBody.success
            );
            routes[path].response.parse(responseBody);
            stream.respond(new_headers);
            stream.end(JSON.stringify(responseBody));
          } else {
            stream.respond({
              "content-type": "text/json; charset=utf-8",
              ":status": 200,
            });
            stream.end(JSON.stringify(requestBody));
          }

          return true;
        }
      } catch (error) {
        console.error(error);
        stream.respond({ ":status": "500" }, { endStream: true });
        return true;
      }
      return false;
    };
  return fn;
}
