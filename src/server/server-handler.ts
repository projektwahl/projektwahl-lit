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
import { readdir, readFile, watch } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loginHandler } from "./routes/login/index.js";
import { createOrUpdateUsersHandler } from "./routes/users/create-or-update.js";
import { usersHandler } from "./routes/users/index.js";
import { openidLoginHandler } from "./routes/login/openid-login.js";
import { openidRedirectHandler } from "./routes/login/redirect.js";
import { extname, relative } from "path/posix";
import { z } from "zod";
import { createOrUpdateProjectsHandler } from "./routes/projects/create-or-update.js";
import { cwd } from "node:process";
import { projectsHandler } from "./routes/projects/index.js";
import { resolve as loaderResolve, load as loaderLoad } from "../loader.js";
import { logoutHandler } from "./routes/login/logout.js";
import zlib from "node:zlib";
import { pipeline, Readable } from "node:stream";
import type { ServerResponse } from "node:http";
import type { Http2ServerResponse } from "node:http2";
import type { MyRequest } from "./express.js";

//const startTime = Date.now();

export async function* getDirs(dir: string): AsyncIterable<string> {
  yield dir;
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getDirs(res);
    }
  }
}

async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, args: string[]) => Promise<string>
): Promise<string> {
  const promises: Promise<string>[] = [];
  str.replaceAll(regex, (match, ...args) => {
    const promise = asyncFn(match, args as string[]);
    promises.push(promise);
    return "";
  });
  const data = await Promise.all(promises);
  return str.replaceAll(regex, () => data.shift() as string);
}

export const defaultHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "cache-control": "private, no-cache",
};

export async function serverHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  const path = z.string().parse(request.url);

  const url = new URL(path, process.env.BASE_URL);

  if (url.pathname === "/favicon.ico" || url.pathname === "/robots.txt") {
    response.writeHead(404, {
      ...defaultHeaders,
    });
    response.end();
  } else if (url.pathname === "/api/v1/hmr") {
    console.log("got request");
    response.writeHead(200, {
      ...defaultHeaders,
      "content-type": "text/event-stream",
    });

    for await (const f of getDirs("./src/client")) {
      void (async () => {
        for await (const event of watch(f)) {
          const baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

          const url = relative(baseUrl, join(f, event.filename));

          (
            response.write as (
              chunk: string | Uint8Array,
              callback?: ((err: Error) => void) | undefined
            ) => boolean
          )(`data: ${url}\n\n`);
        }
      })();
    }
  } else if (url.pathname.startsWith("/api")) {
    // TODO FIXME store this in a routing table and automatically extract types from that
    const executed =
      (await loginHandler(request, response)) ||
      (await logoutHandler(request, response)) ||
      (await openidLoginHandler(request, response)) ||
      (await openidRedirectHandler(request, response)) ||
      (await createOrUpdateUsersHandler(request, response)) ||
      (await createOrUpdateProjectsHandler(request, response)) ||
      (await projectsHandler(request, response)) ||
      (await usersHandler(request, response));

    if (!executed) {
      response.writeHead(404, {
        ...defaultHeaders,
      });
      response.end();
    }
  } else {
    // TODO FIXME AUDIT
    // curl --insecure --path-as-is -v `${process.env.BASE_URL}/../src/index.js`

    const filename = resolve("." + url.pathname);

    const baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

    if (
      filename.startsWith(join(baseUrl, "/src/")) ||
      filename.startsWith(join(baseUrl, "/dist/")) ||
      filename.startsWith(join(baseUrl, "/node_modules/")) ||
      filename.startsWith(join(baseUrl, "/lit/"))
    ) {
      // TODO FIXME caching (server+clientside)

      try {
        //console.log(filename)

        const resolved = await loaderResolve(
          filename,
          {
            parentURL: import.meta.url,
          },
          (specifier: string, context: { parentURL: string | undefined }) => {
            const baseURL = pathToFileURL(`${cwd()}/`).href;
            const { parentURL = baseURL } = context;
            const targetUrl = new URL(specifier, parentURL);
            return {
              url: targetUrl.href,
            };
          }
        );
        //console.log("resolvd", resolved.url)
        const loaded = await loaderLoad(
          resolved.url,
          undefined,
          async (url: string) => {
            return {
              source: await readFile(fileURLToPath(url), {
                encoding: "utf-8",
              }),
            };
          }
        );
        let contents = loaded.source;

        if (extname(filename) === ".js" || extname(filename) === ".ts") {
          contents = await replaceAsync(
            contents,
            /import( )?["']([^"']+)["']/g,
            async (match, args) => {
              if (!import.meta.resolve) {
                throw new Error(
                  "need to run with --experimental-import-meta-resolve"
                );
              }
              let url = await import.meta.resolve(
                args[1],
                pathToFileURL(filename)
              );

              url = relative(
                resolve(fileURLToPath(import.meta.url), "../../.."),
                fileURLToPath(url)
              );

              return `import "/${url}"`;
            }
          );
          contents = await replaceAsync(
            contents,
            /([*} ])from ?["']([^"']+)["']/g,
            async (match, args) => {
              if (!import.meta.resolve) {
                throw new Error(
                  "need to run with --experimental-import-meta-resolve"
                );
              }
              let url = await import.meta.resolve(
                args[1],
                pathToFileURL(filename)
              );

              url = relative(
                resolve(fileURLToPath(import.meta.url), "../../.."),
                fileURLToPath(url)
              );

              return `${args[0]} from "/${url}"`;
            }
          );
        }

        const contentType = filename.endsWith(".css")
          ? "text/css"
          : "application/javascript";

        const raw = new Readable();
        raw.push(contents); // the string you want
        raw.push(null); // indicates end-of-file basically - the end of the stream

        let acceptEncoding = request.headers["accept-encoding"] as string;
        if (!acceptEncoding) {
          acceptEncoding = "";
        }

        const onError = (err: NodeJS.ErrnoException | null) => {
          if (err) {
            // If an error occurs, there's not much we can do because
            // the server has already sent the 200 response code and
            // some amount of data has already been sent to the client.
            // The best we can do is terminate the response immediately
            // and log the error.
            response.end();
            console.error("An error occurred:", err);
          }
        };

        // Note: This is not a conformant accept-encoding parser.
        // See https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
        if (/\bbr\b/.test(acceptEncoding)) {
          response.writeHead(200, {
            ...defaultHeaders,
            "content-type": `${contentType}; charset=utf-8`,
            //"cache-control": "public, max-age=604800, immutable",
            vary: "accept-encoding",
            "content-encoding": "br",
          });
          pipeline(raw, zlib.createBrotliCompress(), response, onError);
        } else {
          response.writeHead(200, {
            ...defaultHeaders,
            "content-type": `${contentType}; charset=utf-8`,
            //"cache-control": "public, max-age=604800, immutable",
            vary: "accept-encoding",
          });
          pipeline(raw, response, onError);
        }
      } catch (error) {
        console.error(error);
        response.writeHead(404, {
          ...defaultHeaders,
        });
        response.end();
      }
    } else {
      const rawContents = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
  
      <!--
  SPDX-License-Identifier: AGPL-3.0-or-later
  SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
  -->
      <style>
        body {
          overflow-y: scroll;
        }
      </style>
      <link
        href="/dist/bootstrap.min.css"
        rel="stylesheet"
      />
      <!--<link rel="preload" href="/dist/chunk-O27XPTNE.js" as="script" crossorigin="anonymous">-->
  
      <title>Projektwahl</title>
    </head>
    <body>
      <script
        type="module"
        src="/src/client/pw-app.js"
      ></script>
      <noscript>Bitte aktiviere JavaScript!</noscript>
  
      <pw-app></pw-app>
    </body>
  </html>
  `;
      // ${await pwApp(url)}

      // current issue: https://github.com/lit/lit/issues/2329

      // TODO FIXME IMPORTANT this doesn't work for parallel rendering
      // TODO FIXME SECURITY THE DOMAIN NEEDS TO BE FORCED TO OUR VALUE OTHERWISE THIS IS PRONE TO ATTACKS
      //window.location.href = url;
      //const ssrResult = render(contents);

      response.writeHead(200, {
        ...defaultHeaders,
        "content-type": "text/html; charset=utf-8",
      });
      //Readable.from(ssrResult).pipe(stream)
      //stream.end()

      response.end(rawContents);
    }
  }
}
