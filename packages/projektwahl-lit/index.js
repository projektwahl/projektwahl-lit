// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import express from "express";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import bodyParser from "body-parser";
import { z } from "zod";
import { get, post } from "./src/lib/express.js";
import { zod2result } from "./src/lib/result.js";


// https://learning-notes.mistermicheels.com/javascript/typescript/runtime-type-checking/
// https://www.azavea.com/blog/2020/10/29/run-time-type-checking-in-typescript-with-io-ts/
// io-ts
// https://github.com/colinhacks/zod
// https://trpc.io/
// https://www.npmjs.com/package/zod#comparison
// https://www.npmjs.com/package/yup

const aMulter = multer({
  limits: {
    fieldSize: 10_000,
    files: 0,
    parts: 50,
  },
});

// https://expressjs.com/en/resources/middleware/compression.html no brotli :(
// https://expressjs.com/en/resources/middleware/csurf.html

const app = express();

app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

morgan.token<express.Request>("id", function getId(req) {
  return req.id;
});

app.use(
  morgan(":id :method :url :status :response-time ms - :res[content-length]")
);

app.use(
  bodyParser.urlencoded({
    extended: false,
    parameterLimit: 50,
  })
);
app.use(aMulter.none());

// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  res.send("hello world");
});

const loginInputSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(1024).regex(/ffa/),
});

/**
* @typedef {z.infer<typeof loginInputSchema>} LoginInputType;
*/

post(app, "/api/v1/login", function (req, res) {
  /** @type {LoginInputType} */
  let zodResult = loginInputSchema.safeParse(req.body);
  const user = zod2result(zodResult);

  res.json(user);
});

get(app, "/api/v1/sleep", function (req, res) {
  setTimeout(() => {
    res.send("hello world");
  }, 1000);
});

const server = app.listen(9001);

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
