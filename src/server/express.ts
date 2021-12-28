// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { zod2result } from "../lib/result.js";
import { json } from "node:stream/consumers";
import { URL } from "url";
import { routes } from "../lib/routes.js";
import type { IncomingHttpHeaders, OutgoingHttpHeaders, ServerHttp2Stream } from "node:http2";
import type { z } from "zod";

export function request<P extends keyof typeof routes>(method: string, path: P, handler: (r: z.infer<typeof routes[P]["request"]>) => Promise<[OutgoingHttpHeaders, z.infer<typeof routes[P]["response"]>]>): ((stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => Promise<boolean>) {
  let fn =
    
    async (stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) => {
      try {
        let url = new URL(headers[":path"]!, "https://localhost:8443");
        if (
          headers[":method"] === method &&
          new RegExp(path).test(/** @type {string} */ (url.pathname))
        ) {
          const body =
            headers[":method"] === "POST" ? await json(stream) : undefined;
          const requestBody = zod2result(routes[path].request, body);
          if (requestBody.success) {
            const [new_headers, responseBody] = await handler(
              requestBody.data
            );
            routes[path].response.parse(responseBody);
            stream.respond(new_headers);
            stream.end(JSON.stringify(responseBody));
          } else {
            console.log(requestBody)
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
