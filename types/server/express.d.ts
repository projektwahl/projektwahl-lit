/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
/// <reference types="node" />
/// <reference types="node" />
import { routes, ResponseType, userSchema } from "../lib/routes.js";
import type { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Http2ServerRequest, Http2ServerResponse, OutgoingHttpHeaders } from "http2";
export type MyRequest = (IncomingMessage | Http2ServerRequest) & Required<Pick<IncomingMessage | Http2ServerRequest, "url" | "method">>;
export declare function requestHandler<P extends keyof typeof routes>(method: string, path: P, handler: (r: z.infer<typeof routes[P]["request"]>, user: z.infer<typeof userSchema>, session_id: Uint8Array | undefined) => PromiseLike<[OutgoingHttpHeaders, ResponseType<P>]> | [OutgoingHttpHeaders, ResponseType<P>]): (url: URL, request: MyRequest, response: ServerResponse | Http2ServerResponse) => Promise<void>;
