// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { createSecureServer } from "node:http2";
import { readFileSync } from "node:fs";
import "./routes/login/openid-client.js";
import cluster from "cluster";
import { watch } from "node:fs/promises";
import { getDirs } from "./server-handler.js";
import { promisify } from "node:util";

if (cluster.isPrimary) {
  console.log(`Primary is running`);

  cluster.fork(); 

  for await (const f of getDirs("./src/server")) {
    (async () => {
      for await (const event of watch(f)) {
        let oldWorkers = { ...cluster.workers };
         
        cluster.fork().on("listening", (address) => {
          for (const id in oldWorkers) {
            oldWorkers[id]?.send("shutdown", () => {});
          }
        })
      }
    })();
  }

  for await (const f of getDirs("./src/lib")) {
    (async () => {
      for await (const event of watch(f)) {
        let oldWorkers = { ...cluster.workers };
         
        cluster.fork().on("listening", (address) => {
          for (const id in oldWorkers) {
            oldWorkers[id]?.send("shutdown", () => {});
          }
        })
      }
    })();
  }
} else {

/*
  openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
  */

const server = createSecureServer({
  key: readFileSync("localhost-privkey.pem"),
  cert: readFileSync("localhost-cert.pem"),
});
server.on("error", (err) => console.error(err));

server.on("stream", async (stream, headers) => {
  try {
    await (await import(`./server-handler.js`)).serverHandler(stream, headers);
  } catch (error) {
    // don't take down the entire server
    // TODO FIXME try sending a 500 in a try catch
    console.error(error);
  }
});

/** @type {import("node:http2").ServerHttp2Session[]} */
let sessions = [];

server.on("session", (session) => {
  sessions.push(session)

  session.on("close", () => {
    // TODO FIXME this is super SLOW
    sessions = sessions.filter(s => s === session)
  })
})

server.listen(8443, () => {
  console.log(`[${cluster.worker?.id}] Server started at https://localhost:8443/`);
});

cluster.worker?.on("message", async (message) => {
  //let getConnections = promisify(server.getConnections).bind(server)
  //console.log(await getConnections())

  if (message === "shutdown") {
    console.log(`[${cluster.worker?.id}] Shutting down`);
    server.close()

    sessions.forEach(session => {
      session.close()
    })

    cluster.worker?.removeAllListeners("message")
    cluster.worker?.kill()
  }
});
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
