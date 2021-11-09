import { readdir, readFile, watch } from "node:fs/promises";
import { sensitiveHeaders } from "node:http2";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { sql } from "./database.js";
import { request } from "./express.js";
import { checkPassword } from "./password.js";

const startTime = Date.now();

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
//console.log("start"+ headers[":path"]+"end")

    // TODO FIXME respond can throw
    let url = new URL(headers[":path"], "https://localhost:8443");

    if (url.pathname === "/") {
      stream.respondWithFile(
        "./src/client/index.html",
        {
          "content-type": "text/html; charset=utf-8",
          ":status": 200,
        },
        {}
      );
    } else if (url.pathname === "/favicon.ico") {
      stream.respond(
        {
          ":status": 404,
        },
        {
          endStream: true,
        }
      );
    } else if (url.pathname === "/api/v1/hmr") {
      console.log("sse start")
      stream.respond({
        ':status': 200,
        'content-type': 'text/event-stream',
      });

      for await (const f of getDirs("./src/client")) {
        (async () => {
          for await (const event of watch(f)) {
            
            console.log("sse", event)
            stream.write(`data: ${f}/${event.filename}\n\n`)
            
          }
        })();
      }
    } else if (url.pathname.startsWith("/api")) {
      console.log("what", url.pathname)

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

      executed =
        executed ||
        (await request("POST", "/api/v1/login", async function (body) {
          console.log(body)
          /** @type {[import("../lib/types").Existing<Pick<import("../lib/types").RawUserType, "id"|"username"|"password_hash">>?]} */
          const [dbUser] =
            await sql`SELECT id, username, password_hash, password_salt, type FROM users WHERE username = ${body.username} LIMIT 1`;

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
              dbUser.password_salt,
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
        let filename = "." + url.pathname;
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
}