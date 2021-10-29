import express from "express";
import { Routes } from "../routes";
export declare function post<P extends keyof Routes>(app: express.Express, path: P, handler: (req: express.Request<{}, any, any>, res: express.Response<Routes[P], Record<string, any>>) => void): void;
export declare function get<P extends keyof Routes>(app: express.Express, path: P, handler: (req: express.Request<{}, any, any>, res: express.Response<Routes[P], Record<string, any>>) => void): void;
