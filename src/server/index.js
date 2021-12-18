/// <reference path="index.d.ts" />
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { createSecureServer } from "node:http2";
import { readFileSync } from "node:fs";
import "./routes/login/openid-client.js";

const numCPUs = 1; // cpus().length;

// npm run server
/*
if (cluster.isPrimary) {
  //console.log(`Primary is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {});

  for await (const f of getDirs("./src/server")) {
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
  */
/*
  openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
  */

global.server = createSecureServer({
  key: readFileSync("localhost-privkey.pem"),
  cert: readFileSync("localhost-cert.pem"),
});
server.on("error", (err) => console.error(err));

server.on("stream", async (stream, headers) => {
  try {
    await (await import(`./server-handler.js`)).serverHandler(stream, headers);
  } catch (error) {
    // don't take down the entire server
    console.error(error);
  }
});

server.listen(8443, () => {
  console.log("Server started at https://localhost:8443/");
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
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
*/
