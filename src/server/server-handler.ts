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
import {
  createProjectsHandler,
  updateProjectsHandler,
} from "./routes/projects/create-or-update.js";
import { cwd } from "node:process";
import { projectsHandler } from "./routes/projects/index.js";
import { logoutHandler } from "./routes/login/logout.js";
import { pipeline, Readable } from "node:stream";
import type { Http2ServerResponse } from "node:http2";
import type { MyRequest } from "./express.js";
import { choicesHandler } from "./routes/choices/index.js";
import { updateChoiceHandler } from "./routes/choices/create-or-update.js";
import { z, ZodIssueCode, ZodIssueOptionalMessage } from "zod";
import { sessionsHandler } from "./routes/sessions/index.js";
import { sudoHandler } from "./routes/login/sudo.js";
import { settingsHandler } from "./routes/settings/index.js";
import { updateSettingsHandler } from "./routes/settings/create-or-update.js";

// https://github.com/colinhacks/zod/blob/master/src/ZodError.ts
type ErrorMapCtx = {
  defaultError: string;
};

const myErrorMap: z.ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
): { message: string } => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        message = "Pflichtfeld";
      } else {
        message = `Erwarte ${issue.expected}, aber ${issue.received} bekommen`;
      }
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unbekannte Schlüssel: ${issue.keys
        .map((k) => `'${k}'`)
        .join(", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Ungültige Eingabe`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Ungültiger Unterscheidungswert. Erwarte ${issue.options
        .map((val) => (typeof val === "string" ? `'${val}'` : val))
        .join(" | ")}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Ungültiger Auswahlwert. Erwarte ${issue.options
        .map((val) => (typeof val === "string" ? `'${val}'` : val))
        .join(" | ")}`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Ungültige Funktionargumente`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Ungültiger Funktionsrückgabewert`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Ungültiges Datum`;
      break;
    case ZodIssueCode.invalid_string:
      if (issue.validation !== "regex")
        message = `Ungültig ${issue.validation}`;
      else message = "Ungültig";
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Liste muss ${issue.inclusive ? `mindestens` : `mehr als`} ${
          issue.minimum
        } Element enthalten`;
      else if (issue.type === "string")
        message = `Text muss ${issue.inclusive ? `mindestens` : `mehr als`} ${
          issue.minimum
        } Zeichen haben`;
      else if (issue.type === "number")
        message = `Zahl muss größer ${issue.inclusive ? ` gleich` : ``}${
          issue.minimum
        } sein`;
      else message = "Ungültige Eingabe";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Liste muss ${
          issue.inclusive ? `höchstens` : `weniger als`
        } ${issue.maximum} Elemente enthalten`;
      else if (issue.type === "string")
        message = `Text muss ${issue.inclusive ? `höchstens` : `weniger als`} ${
          issue.maximum
        } Zeichen haben`;
      else if (issue.type === "number")
        message = `Zahl muss kleiner ${issue.inclusive ? ` gleich` : ``}${
          issue.maximum
        } sein`;
      else message = "Ungültige Eingabe";
      break;
    case ZodIssueCode.custom:
      message = `Ungültige Eingabe`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Werte konnten nicht kombiniert werden`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Zahl muss ein Vielfaches von ${issue.multipleOf} sein`;
      break;
    default:
      message = _ctx.defaultError;
  }
  return { message };
};
z.setErrorMap(myErrorMap);

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const promise = asyncFn(match, args);
    promises.push(promise);
    return "";
  });
  const data = await Promise.all(promises);
  // this is fine as the length is equal
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return str.replaceAll(regex, () => data.shift()!);
}

export const defaultHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "cache-control": "private, no-cache",
  "Content-Security-Policy":
    "default-src 'none'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; form-action 'none'",
};

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL not set.");
}

const BASE_URL = new URL(process.env.BASE_URL);

export async function serverHandler(
  request: MyRequest,
  response: Http2ServerResponse
) {
  const url = new URL(request.url, BASE_URL);

  if (
    (process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "testing") &&
    (url.pathname === "/favicon.ico" || url.pathname === "/robots.txt")
  ) {
    response.writeHead(404, {
      ...defaultHeaders,
    });
    response.end();
  } else if (
    (process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "testing") &&
    url.pathname === "/api/v1/hmr"
  ) {
    response.writeHead(200, {
      ...defaultHeaders,
      "content-type": "text/event-stream",
    });

    for await (const f of getDirs("./src/client")) {
      void (async () => {
        for await (const event of watch(f)) {
          const baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

          const url = relative(baseUrl, join(f, event.filename));

          response.write(`data: ${url}\n\n`);
        }
      })();
    }
  } else if (url.pathname.startsWith("/api")) {
    switch (url.pathname) {
      case "/api/v1/login":
        await loginHandler(url, request, response);
        break;
      case "/api/v1/logout":
        await logoutHandler(url, request, response);
        break;
      case "/api/v1/openid-login":
        await openidLoginHandler(url, request, response);
        break;
      case "/api/v1/redirect":
        await openidRedirectHandler(url, request, response);
        break;
      case "/api/v1/users/create-or-update":
        await createOrUpdateUsersHandler(url, request, response);
        break;
      case "/api/v1/projects/create":
        await createProjectsHandler(url, request, response);
        break;
      case "/api/v1/projects/update":
        await updateProjectsHandler(url, request, response);
        break;
      case "/api/v1/projects":
        await projectsHandler(url, request, response);
        break;
      case "/api/v1/users":
        await usersHandler(url, request, response);
        break;
      case "/api/v1/choices":
        await choicesHandler(url, request, response);
        break;
      case "/api/v1/choices/update":
        await updateChoiceHandler(url, request, response);
        break;
      case "/api/v1/sessions":
        await sessionsHandler(url, request, response);
        break;
      case "/api/v1/sudo":
        await sudoHandler(url, request, response);
        break;
      case "/api/v1/settings":
        await settingsHandler(url, request, response);
        break;
      case "/api/v1/settings/update":
        await updateSettingsHandler(url, request, response);
        break;
      default:
        response.writeHead(404, {
          ...defaultHeaders,
        });
        response.end();
    }
  } else if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "testing"
  ) {
    const { resolve: loaderResolve, load: loaderLoad } = await import(
      "../loader.js"
    );

    const filename = resolve("." + url.pathname);

    const baseUrl = resolve(fileURLToPath(import.meta.url), "../../..");

    if (
      filename.startsWith(join(baseUrl, "/src/")) ||
      filename.startsWith(join(baseUrl, "/dist/")) ||
      filename.startsWith(join(baseUrl, "/node_modules/")) ||
      filename.startsWith(join(baseUrl, "/lit/"))
    ) {
      try {
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

        response.writeHead(200, {
          ...defaultHeaders,
          "content-type": `${contentType}; charset=utf-8`,
          vary: "accept-encoding",
        });
        pipeline(raw, response, onError);
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
      <link rel="stylesheet" href="/src/client/main.css">
      <link
        href="/node_modules/bootstrap/dist/css/bootstrap.css"
        rel="stylesheet"
      />
      <!--<link rel="preload" href="/dist/chunk-O27XPTNE.js" as="script" crossorigin="anonymous">-->
  
      <title>Projektwahl</title>
    </head>
    <body class="height-100">
      <script
        type="module"
        src="/src/client/pw-app.js"
      ></script>
      <noscript>Bitte aktiviere JavaScript!</noscript>
  
      <pw-app></pw-app>
    </body>
  </html>
  `;

      response.writeHead(200, {
        ...defaultHeaders,
        "content-type": "text/html; charset=utf-8",
      });

      response.end(rawContents);
    }
  } else {
    response.writeHead(404, {
      ...defaultHeaders,
      "content-type": "text/html; charset=utf-8",
    });
    response.end(`
    <!DOCTYPE html>
  <html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
  
      <!--
  SPDX-License-Identifier: AGPL-3.0-or-later
  SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
  -->
  
      <title>Projektwahl</title>
    </head>
    <body>
      
        <h1>404 Nicht gefunden</h1>

        <p>Die Seite konnte leider nicht gefunden werden.</p>

    </body>
  </html>
    `);
  }
}
