// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { Http2Server } from "node:http2";

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts
// https://dev.to/dakdevs/extend-express-request-in-typescript-1693
// https://dev.to/kwabenberko/extend-express-s-request-object-with-typescript-declaration-merging-1nn5
declare namespace Express {
  export interface Request {
    id: string;
  }
}

declare global {
  var server: Http2Server;
}
