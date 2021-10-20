import express from "express";
import { Routes } from "../routes";

export function post<P extends keyof Routes>(app: express.Express, path: P, handler: (req: express.Request<{}, any, any>, res: express.Response<Routes[P], Record<string, any>>) => void) {
    app.post(path, handler);
}

export function get<P extends keyof Routes>(app: express.Express, path: P, handler: (req: express.Request<{}, any, any>, res: express.Response<Routes[P], Record<string, any>>) => void) {
    app.get(path, handler);
}