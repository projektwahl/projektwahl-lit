// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import express from "express";
import { Routes } from "../routes";

/** @type {<P extends keyof Routes>(app: express.Express, path: P, handler: ( req: express.Request<{}, any, any>, res: express.Response<Routes[P], Record<string, any>>) => void) => void} */
export function post(
  app,
  path,
  handler,
) {
  app.post(path, handler);
}

/** @type {<P extends keyof Routes>(app: express.Express, path: P, handler: ( req: express.Request<{}, any, any>, res: express.Response<Routes[P], Record<string, any>>) => void) => void} */
export function get(
  app,
  path,
  handler
) {
  app.get(path, handler);
}
