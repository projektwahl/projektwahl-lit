/// <reference path="index.d.ts" />
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { z } from "zod";
import { request } from "./express.js";
import { zod2result } from "../lib/result.js";
import { checkPassword } from "./password.js";
import { sql } from './database.js'
import { createSecureServer } from 'node:http2'
import { readFileSync } from 'node:fs'
import cluster from 'cluster';
import { cpus } from 'os';
import process from 'process';
import { workerData } from "node:worker_threads";
import repl from 'repl';
import { readFile } from "node:fs/promises";
import { fileURLToPath } from 'url';
import { pathToFileURL } from "node:url";

// npm run server -w projektwahl-lit-server

const numCPUs = 3;// cpus().length;
/*
if (cluster.isPrimary) {
  //console.log(`Primary is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    //console.log(`worker ${worker.id} died`);
    cluster.fork();
  });
*/
//} else {
  
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
    return ""
  });
  const data = await Promise.all(promises);
  return str.replaceAll(regex, () => /** @type {string} */ (data.shift()));
}


global.server = createSecureServer({
    key: readFileSync('localhost-privkey.pem'),
    cert: readFileSync('localhost-cert.pem')
  });
  server.on('error', (err) => console.error(err));

  server.on('stream', async (stream, headers) => {
    //console.log("start"+ headers[":path"]+"end")
    
    // TODO FIXME respond can throw

    if (headers[":path"] === "/") {
      stream.respondWithFile("./src/client/index.html", {
        'content-type': 'text/html; charset=utf-8',
        ':status': 200
      }, {});
    } else if (headers[":path"] === "/favicon.ico") {
      stream.respond({
        ':status': 404
      }, {
        endStream: true
      })
    } else if (headers[":path"]?.startsWith("/api")) {
      await request("GET", "/api/v1/sleep", async function (req) {
        return "hello world";
      })(stream, headers);


    } else {
      // TODO FIXME injection
      // TODO FIXME caching (server+clientside)
      try {
        let filename = "." + headers[":path"]
        console.log("mod", filename)
        let contents = await readFile(filename, {
          encoding: "utf-8"
        })
        console.log(contents)

        contents = await replaceAsync(contents, /import( )?"([^"]+)"/g, async (match, args) => {
          console.log(match)
          console.log(args)
          let url = await import.meta.resolve(args[1], pathToFileURL(filename))
          console.log(url)
          url = url.substring("file:///home/moritz/Documents/projektwahl-lit/".length)
          return `import "/${url}"`
        });
        contents = await replaceAsync(contents, /([*} ])from ?"([^"]+)"/g, async (match, args) => {
          console.log(match)
          console.log(args)
          let url = await import.meta.resolve(args[1], pathToFileURL(filename))
          console.log(url)
          url = url.substring("file:///home/moritz/Documents/projektwahl-lit/".length)
          return `${args[0]} from "/${url}"`
        });
        console.log(contents)

        stream.respond({
          'content-type': 'application/javascript; charset=utf-8',
          ':status': 200
        });
        stream.end(contents);
      } catch (error) {
        stream.respondWithFile("./src/client/index.html", {
          'content-type': 'text/html; charset=utf-8',
          ':status': 200
        }, {});
      }
    }
  });

  server.listen(8443, () => {
    //console.log(`Worker ${cluster.worker?.id} started`);

    /*setTimeout(() => {
      process.kill(process.pid, "SIGTERM")
    }, Math.random()*2000);*/
  });
//}

//repl.start({})

// https://learning-notes.mistermicheels.com/javascript/typescript/runtime-type-checking/
// https://www.azavea.com/blog/2020/10/29/run-time-type-checking-in-typescript-with-io-ts/
// io-ts
// https://github.com/colinhacks/zod
// https://trpc.io/
// https://www.npmjs.com/package/zod#comparison
// https://www.npmjs.com/package/yup

/*
post(app, "/api/v1/login", async function (req, res) {
  const loginRequest = zod2result(loginInputSchema.safeParse(req.body));

  if (loginRequest.result == "failure") {
    return res.json(loginRequest);
  }

  /** @type {[import("projektwahl-lit-lib/src/types").Existing<Pick<import("projektwahl-lit-lib/src/types").RawUserType, "id"|"username"|"password_hash">>?]} /
  const [dbUser] = await sql`SELECT id, username, password_hash, type FROM users WHERE username = ${loginRequest.success.username} LIMIT 1`;

  if (dbUser === undefined) {
    return res.json({
      result: "failure",
      failure: {
        username: "Nutzer existiert nicht!"
      }
    })
  }

  if (dbUser.password_hash == null || !(await checkPassword(dbUser.password_hash, loginRequest.success.password))) {
		return res.json({
      result: 'failure',
      failure: {
        password: 'Falsches Passwort!'
      }
		});
	}

  /** @type {[Pick<import("projektwahl-lit-lib/src/types").RawSessionType, "session_id">]} /
  const [session] = await sql.begin('READ WRITE', async (sql) => {
		return await sql`INSERT INTO sessions (user_id) VALUES (${dbUser.id}) RETURNING session_id`;
	});

  res.cookie("strict_id", session.session_id, {
    maxAge: 48 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  })
  res.cookie("lax_id", session.session_id, {
    maxAge: 48 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  })
  return res.json({
    result: "success",
    success: undefined,
  });
});


process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
*/