/// <reference types="node" />
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import type { OutgoingHttpHeaders } from "node:http2";
import type { PendingQuery, Row } from "postgres";
import type { z } from "zod";
import type { entityRoutes, ResponseType, userSchema } from "../lib/routes.js";
type entitiesType0 = {
    [K in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[K]["request"]>;
};
type entitiesType1 = {
    [K in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[K]["request"]>["sorting"][number][0];
};
type entitiesType2 = {
    [K in keyof typeof entityRoutes]: {
        [R in z.infer<typeof entityRoutes[K]["request"]>["sorting"][number][0]]: z.infer<typeof entityRoutes[K]["request"]>["sorting"][number][1];
    };
};
type entitiesType9 = {
    [K in keyof typeof entityRoutes]: {
        [R in z.infer<typeof entityRoutes[K]["request"]>["sorting"][number][0]]: z.infer<typeof entityRoutes[K]["request"]>["sorting"][number][2];
    };
};
type entitiesType18 = {
    [K in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[K]["request"]>["sorting"][number][0];
};
type entitiesType8 = {
    [K in keyof typeof entityRoutes]: {
        [key in entitiesType1[K]]: (order: entitiesType2[K][key], paginationDirection: "forwards" | "backwards", v: entitiesType9[K][key]) => PendingQuery<Row[]>;
    };
};
export declare function fetchData<R extends keyof typeof entityRoutes>(loggedInUser: Exclude<z.infer<typeof userSchema>, undefined>, path: R, query: entitiesType0[R], sqlQuery: (query: entitiesType0[R]) => PendingQuery<Row[]>, orderByQueries: entitiesType8[R], tiebreaker: entitiesType18[R] | undefined): Promise<[OutgoingHttpHeaders, ResponseType<R>]>;
export {};
