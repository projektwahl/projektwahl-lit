/// <reference types="node" />
/// <reference types="node" />
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import postgres from "postgres";
import type { routes, userSchema } from "../../../lib/routes.js";
import { z } from "zod";
export declare const createProjectsHandler: (url: URL, request: import("../../express.js").MyRequest, response: import("http2").Http2ServerResponse | import("http").ServerResponse<import("http").IncomingMessage>) => Promise<void>;
export declare const updateProjectsHandler: (url: URL, request: import("../../express.js").MyRequest, response: import("http2").Http2ServerResponse | import("http").ServerResponse<import("http").IncomingMessage>) => Promise<void>;
export declare function createOrUpdateProjectsHandler<P extends "/api/v1/projects/create" | "/api/v1/projects/update">(path: P, dbquery: (sql: postgres.TransactionSql<Record<string, unknown>>, project: z.infer<typeof routes[P]["request"]>, loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>) => Promise<z.infer<typeof routes[P]["response"]>[]>): (url: URL, request: import("../../express.js").MyRequest, response: import("http2").Http2ServerResponse | import("http").ServerResponse<import("http").IncomingMessage>) => Promise<void>;
