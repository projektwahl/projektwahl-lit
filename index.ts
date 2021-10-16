// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import express from "express";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import bodyParser from "body-parser";


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

app.post("/api/v1/login", function (req, res) {
  console.log(req.body);

  res.send("hello world");
});

const server = app.listen(9001);

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
