import type { z } from "zod";
import { entityRoutes } from "../lib/routes.js";

// Mapped Types
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

type entitesType = {
    [K in keyof typeof entityRoutes]: typeof entityRoutes[K]
};

export async function fetchData<R extends keyof typeof entityRoutes>(path: R): z.infer<typeof entityRoutes[R]["response"]> {
    let entitySchema: entitesType[R] = entityRoutes[path];

    let b: entitesType[R]["response"]["options"][0]["shape"]["data"]["shape"]["entities"] = entitySchema["response"]["options"][0]["shape"]["data"]["shape"]["entities"];

    //entitySchema.parse({})
}
