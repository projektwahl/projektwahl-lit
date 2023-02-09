/// <reference types="node" />
import type { Http2ServerResponse } from "node:http2";
import type { MyRequest } from "./express.js";
export declare function getDirs(dir: string): AsyncIterable<string>;
export declare const defaultHeaders: {
    "x-content-type-options": string;
    "x-frame-options": string;
    "cache-control": string;
    "Content-Security-Policy": string;
};
export declare function serverHandler(request: MyRequest, response: Http2ServerResponse): Promise<void>;
