import { readdir, readFile, watch } from "node:fs/promises";
import { sensitiveHeaders } from "node:http2";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { sql } from "./database.js";
import { request } from "./express.js";
import { checkPassword } from "./password.js";
import { loginHandler } from "./routes/login/index.js";
import { sleepHandler } from "./routes/sleep/index.js";
import { usersHandler } from "./routes/users/index.js";

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
      stream.respond({
        ':status': 200,
        'content-type': 'text/event-stream',
      });

      for await (const f of getDirs("./src/client")) {
        (async () => {
          for await (const event of watch(f)) {
            stream.write(`data: ${f}/${event.filename}\n\n`)
          }
        })();
      }
    } else if (url.pathname.startsWith("/api")) {
      let executed = (await loginHandler(stream, headers)) || 
      (await sleepHandler(stream, headers)) || (await usersHandler(stream, headers));
        
      if (!executed) {
        stream.respond(
          {
            ":status": 404,
          },
          { endStream: true }
        );
      }
    } else if (url.pathname.startsWith("/src") || url.pathname.startsWith("/node_modules")) {
      // TODO FIXME injection
      // TODO FIXME caching (server+clientside)
        let filename = "." + url.pathname;
        //console.log("mod", filename)
        let contents = await readFile(filename, {
          encoding: "utf-8",
        });
        //console.log(contents)

        // TODO FIXME single and double quotes
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
      } else {
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