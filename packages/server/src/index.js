// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { z } from "zod";
import { get, post } from "./express.js";
import { zod2result } from "projektwahl-lit-lib/src/result.js";
import { checkPassword } from "./password.js";
import { sql } from './database.js'
import { createSecureServer } from 'node:http2'
import { readFileSync } from 'node:fs'

/*
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
*/
const server = createSecureServer({
  key: readFileSync('localhost-privkey.pem'),
  cert: readFileSync('localhost-cert.pem')
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  
  
});

server.listen(8443);

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

get(app, "/api/v1/sleep", function (req, res) {
  setTimeout(() => {
    res.send("hello world");
  }, 1000);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
*/