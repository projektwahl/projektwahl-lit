/// <reference path="index.d.ts" />
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { z } from "zod";
import { request } from "./express.js";
import { zod2result } from "../lib/result.js";
import { checkPassword } from "./password.js";
import { sql } from "./database.js";
import { createSecureServer, sensitiveHeaders } from "node:http2";
import { readFileSync, watchFile } from "node:fs";
import cluster from "cluster";
import { cpus } from "os";
import process from "process";
import { workerData } from "node:worker_threads";
import repl from "repl";
import { readdir, readFile, watch } from "node:fs/promises";
import { fileURLToPath } from "url";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const numCPUs = 1; // cpus().length;

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

// npm run server

if (cluster.isPrimary) {
  //console.log(`Primary is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {});

  for await (const f of getDirs(".")) {
    (async () => {
      for await (const event of watch(f)) {
        //console.log(event)
        let oldWorkers = { ...cluster.workers };
        for (let i = 0; i < numCPUs; i++) {
          console.log("new");
          cluster.fork();
        }
        for (const id in oldWorkers) {
          console.log(`worker ${id} died`);
          oldWorkers[id]?.process.kill("SIGTERM");
        }
      }
    })();
  }
} else {
  /*
  openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
  */

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

  const startTime = Date.now();

  global.server = createSecureServer({
    key: readFileSync("localhost-privkey.pem"),
    cert: readFileSync("localhost-cert.pem"),
  });
  server.on("error", (err) => console.error(err));

  server.on("stream", async (stream, headers) => {
    //console.log("start"+ headers[":path"]+"end")

    // TODO FIXME respond can throw

    if (headers[":path"] === "/") {
      stream.respondWithFile(
        "./src/client/index.html",
        {
          "content-type": "text/html; charset=utf-8",
          ":status": 200,
        },
        {}
      );
    } else if (headers[":path"] === "/favicon.ico") {
      stream.respond(
        {
          ":status": 404,
        },
        {
          endStream: true,
        }
      );
    } else if (headers[":path"]?.startsWith("/api")) {
      console.log("what", headers[":path"])

      let executed = await request("GET", "/api/v1/sleep", function (req) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve([
              {
                "content-type": "text/json; charset=utf-8",
                ":status": 200,
              },
              undefined,
            ]);
          }, 1000);
        });
      })(stream, headers);

      executed =
        executed ||
        (await request("GET", "/api/v1/update", async function (req) {
          return [
            {
              "content-type": "text/json; charset=utf-8",
              ":status": 200,
            },
            startTime,
          ];
        })(stream, headers));

        console.log("iiii", executed)

      executed =
        executed ||
        (await request("POST", "/api/v1/login", async function (body) {
          console.log("jojojo")
          /** @type {[import("../lib/types").Existing<Pick<import("../lib/types").RawUserType, "id"|"username"|"password_hash">>?]} */
          const [dbUser] =
            await sql`SELECT id, username, password_hash, type FROM users WHERE username = ${body.username} LIMIT 1`;

          if (dbUser === undefined) {
            return [{
              "content-type": "text/json; charset=utf-8",
              ":status": 200,
            }, {
              result: "failure",
              failure: {
                username: "Nutzer existiert nicht!",
              },
            }];
          }

          if (
            dbUser.password_hash == null ||
            !(await checkPassword(
              dbUser.password_hash,
              "FIXMESALT",
              body.password
            ))
          ) {
            return [{
              "content-type": "text/json; charset=utf-8",
              ":status": 200,
            }, {
              result: "failure",
              failure: {
                password: "Falsches Passwort!",
              },
            }];
          }

          /** @type {[Pick<import("../lib/types").RawSessionType, "session_id">]} */
          const [session] = await sql.begin("READ WRITE", async (sql) => {
            return await sql`INSERT INTO sessions (user_id) VALUES (${dbUser.id}) RETURNING session_id`;
          });

          const headers = {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
            [sensitiveHeaders]: [
              `Set-Cookie: strict_id=${
                session.session_id
              }; Secure; SameSite=Strict; HttpOnly; Max-Age=${48 * 60 * 60};`,
              `Set-Cookie: lax_id=${
                session.session_id
              }; Secure; SameSite=Lax; HttpOnly; Max-Age=${48 * 60 * 60};`,
            ],
          };
          return [
            headers,
            {
              result: "success",
              success: undefined,
            },
          ];
        })(stream, headers));

      if (!executed) {
        stream.respond(
          {
            ":status": 404,
          },
          { endStream: true }
        );
      }
    } else {
      // TODO FIXME injection
      // TODO FIXME caching (server+clientside)
      try {
        let filename = "." + headers[":path"];
        //console.log("mod", filename)
        let contents = await readFile(filename, {
          encoding: "utf-8",
        });
        //console.log(contents)

        contents = await replaceAsync(
          contents,
          /import( )?"([^"]+)"/g,
          async (match, args) => {
            //console.log(match)
            //console.log(args)
            let url = await import.meta.resolve(
              args[1],
              pathToFileURL(filename)
            );
            //console.log(url)
            url = url.substring(
              "file:///home/moritz/Documents/projektwahl-lit/".length
            );
            return `import "/${url}"`;
          }
        );
        contents = await replaceAsync(
          contents,
          /([*} ])from ?"([^"]+)"/g,
          async (match, args) => {
            //console.log(match)
            //console.log(args)
            let url = await import.meta.resolve(
              args[1],
              pathToFileURL(filename)
            );
            //console.log(url)
            url = url.substring(
              "file:///home/moritz/Documents/projektwahl-lit/".length
            );
            return `${args[0]} from "/${url}"`;
          }
        );
        //console.log(contents)

        stream.respond({
          "content-type": "application/javascript; charset=utf-8",
          ":status": 200,
        });
        stream.end(contents);
      } catch (error) {
        stream.respondWithFile(
          "./src/client/index.html",
          {
            "content-type": "text/html; charset=utf-8",
            ":status": 200,
          },
          {}
        );
      }
    }
  });

  server.listen(8443, () => {});
}

//repl.start({})

// https://learning-notes.mistermicheels.com/javascript/typescript/runtime-type-checking/
// https://www.azavea.com/blog/2020/10/29/run-time-type-checking-in-typescript-with-io-ts/
// io-ts
// https://github.com/colinhacks/zod
// https://trpc.io/
// https://www.npmjs.com/package/zod#comparison
// https://www.npmjs.com/package/yup

/*
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
*/
