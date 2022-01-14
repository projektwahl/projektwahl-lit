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
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import "./routes/login/openid-client.js";
//import cluster from "cluster";
import { watch, readdir } from "node:fs/promises";
import { getDirs, serverHandler } from "./server-handler.js";

console.log(await readdir("/dev/fd/"));

/*
if (cluster.isPrimary) {
  console.log(`Primary is running`);

  cluster.fork();

  for await (const f of getDirs("./src/server")) {
    void (async () => {
      for await (const _ of watch(f)) {
        const oldWorkers = { ...cluster.workers };

        cluster.fork().on("listening", () => {
          for (const id in oldWorkers) {
            oldWorkers[id]?.send("shutdown");
          }
        });
      }
    })();
  }

  for await (const f of getDirs("./src/lib")) {
    void (async () => {
      for await (const _ of watch(f)) {
        const oldWorkers = { ...cluster.workers };

        cluster.fork().on("listening", () => {
          for (const id in oldWorkers) {
            oldWorkers[id]?.send("shutdown");
          }
        });
      }
    })();
  }
} else {*/
  /*
  openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
  */

  const server = createServer(
    {
      key: readFileSync("localhost-privkey.pem"),
      cert: readFileSync("localhost-cert.pem"),
      allowHTTP1: true,
    },
    (request, response) => {
      serverHandler(request, response).catch((error) => {
        // TODO FIXME try sending a 500 in a try catch
        console.error(error);
      });
    }
  );

  server.listen({ _handle: { fd: 3 } }, 511, () => {
    /*console.log(
      `[${
        cluster.worker?.id ?? "unknown"
      }] Server started at https://localhost:8443/`
    );*/
  });
/*
  cluster.worker?.on("message", (message) => {
    //let getConnections = promisify(server.getConnections).bind(server)
    //console.log(await getConnections())

    if (message === "shutdown") {
      console.log(`[${cluster.worker?.id ?? "unknown"}] Shutting down`);
      server.close();

      cluster.worker?.removeAllListeners("message");
      cluster.worker?.kill();
    }
  });*/
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
