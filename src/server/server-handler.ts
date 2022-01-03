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
import path, { extname, relative } from "path/posix";
import { z } from "zod";
import { createOrUpdateProjectsHandler } from "./routes/projects/create-or-update.js";
import { cwd } from "node:process";
import { projectsHandler } from "./routes/projects/index.js";
import esbuild from "esbuild";
import { resolve as loaderResolve, load as loaderLoad } from "../loader.js";
import { logoutHandler } from "./routes/login/logout.js";

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
  asyncFn: (match: string, args: any) => Promise<string>
): Promise<string> {
  const promises: Promise<string>[] = [];
  str.replaceAll(regex, (match, ...args) => {
    const promise = asyncFn(match, args);
    promises.push(promise);
    return "";
  });
  const data = await Promise.all(promises);
  return str.replaceAll(regex, () => data.shift() as string);
}

export async function serverHandler(
  stream: import("http2").ServerHttp2Stream,
  headers: import("http").IncomingHttpHeaders
) {
  const path = z.string().parse(headers[":path"]);

  let url = new URL(path, "https://localhost:8443");

  if (url.pathname === "/favicon.ico") {
    stream.respond(
      {
        ":status": 404,
      },
      {
        endStream: true,
      }
    );
  } else if (url.pathname === "/api/v1/hmr") {
    console.log("got request");
    stream.respond({
      ":status": 200,
      "content-type": "text/event-stream",
    });

    for await (const f of getDirs("./src/client")) {
      (async () => {
        for await (const event of watch(f)) {
          let baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

          let url = relative(baseUrl, join(f, event.filename));

          stream.write(`data: ${url}\n\n`);
        }
      })();
    }
  } else if (url.pathname.startsWith("/api")) {
    // TODO FIXME store this in a routing table and automatically extract types from that
    let executed =
      (await loginHandler(stream, headers)) ||
      (await logoutHandler(stream, headers)) ||
      (await openidLoginHandler(stream, headers)) ||
      (await openidRedirectHandler(stream, headers)) ||
      (await createOrUpdateUsersHandler(stream, headers)) ||
      (await createOrUpdateProjectsHandler(stream, headers)) ||
      (await projectsHandler(stream, headers)) ||
      (await usersHandler(stream, headers));

    if (!executed) {
      stream.respond(
        {
          ":status": 404,
        },
        { endStream: true }
      );
    }
  } else {
    // TODO FIXME AUDIT
    // curl --insecure --path-as-is -v https://localhost:8443/../src/index.js

    let filename = resolve("." + url.pathname);

    let baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

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
          (specifier, context, defaultResolve) => {
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
              let url = await import.meta.resolve!(
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
              let url = await import.meta.resolve!(
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

        stream.respond({
          "content-type": "application/javascript; charset=utf-8",
          ":status": 200,
        });
        stream.end(contents);
      } catch (error) {
        console.error(error);
        stream.respond(
          {
            ":status": 404,
          },
          { endStream: true }
        );
      }
    } else {
      let rawContents = `<!DOCTYPE html>
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
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossorigin="anonymous"
      />
  
      <title>Hello, world!</title>
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

      stream.respond({
        "content-type": "text/html; charset=utf-8",
        ":status": 200,
      });
      //Readable.from(ssrResult).pipe(stream)
      //stream.end()

      stream.end(rawContents);
    }
  }
}
