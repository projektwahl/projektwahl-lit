import { readdir, readFile, watch } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loginHandler } from "./routes/login/index.js";
import { sleepHandler } from "./routes/sleep/index.js";
import { createUsersHandler } from "./routes/users/create-or-update.js";
import { usersHandler } from "./routes/users/index.js";
import { openidLoginHandler } from "./routes/login/openid-login.js";
import { openidRedirectHandler } from "./routes/login/redirect.js";
import path, { extname, relative } from "path/posix";
import { z } from "zod";
import { createProjectsHandler } from "./routes/projects/create-or-update.js";

//const startTime = Date.now();

/**
 *
 * @param {string} dir
 * @returns {AsyncIterable<string>}
 */
async function* getDirs(dir) {
  yield dir;
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getDirs(res);
    }
  }
}

/**
 *
 * @param {string} str
 * @param {RegExp} regex
 * @param {(match: string, args: any) => Promise<string>} asyncFn
 * @returns {Promise<string>}
 */
async function replaceAsync(str, regex, asyncFn) {
  /** @type {Promise<string>[]} */
  const promises = [];
  str.replaceAll(regex, (match, ...args) => {
    const promise = asyncFn(match, args);
    promises.push(promise);
    return "";
  });
  const data = await Promise.all(promises);
  return str.replaceAll(regex, () => /** @type {string} */ (data.shift()));
}

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http").IncomingHttpHeaders} headers
 */
export async function serverHandler(stream, headers) {
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
    stream.respond({
      ":status": 200,
      "content-type": "text/event-stream",
    });

    for await (const f of getDirs("./src/client")) {
      (async () => {
        for await (const event of watch(f)) {
          stream.write(`data: ${f}/${event.filename}\n\n`);
        }
      })();
    }
  } else if (url.pathname.startsWith("/api")) {
    // TODO FIXME store this in a routing table and automatically extract types from that
    let executed =
      (await loginHandler(stream, headers)) ||
      (await openidLoginHandler(stream, headers)) ||
      (await openidRedirectHandler(stream, headers)) ||
      (await sleepHandler(stream, headers)) ||
      (await createUsersHandler(stream, headers)) ||
      (await createProjectsHandler(stream, headers)) ||
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

    let filename = resolve("." + path);

    let baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

    if (
      filename.startsWith(join(baseUrl, "/src/")) ||
      filename.startsWith(join(baseUrl, "/node_modules/")) ||
      filename.startsWith(join(baseUrl, "/lit/"))
    ) {
      // TODO FIXME caching (server+clientside)

      try {
        let contents = await readFile(filename, {
          encoding: "utf-8",
        });

        if (extname(filename) === ".js") {
          contents = await replaceAsync(
            contents,
            /import( )?["']([^"']+)["']/g,
            async (match, args) => {
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

        stream.respond({
          "content-type": "application/javascript; charset=utf-8",
          ":status": 200,
        });
        stream.end(contents);
      } catch (error) {
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
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"
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
