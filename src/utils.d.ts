import { Result } from "./lib/result";
import { Routes } from "./routes";
export declare const myFetch: <P extends keyof Routes>(url: P, options: RequestInit | undefined) => Promise<Result<Routes[P], {
    network?: string;
} & { [key in keyof Routes[P]]?: string; }>>;
//# sourceMappingURL=utils.d.ts.map