/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { cwd } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { stat } from "node:fs/promises";

// npx tsc --declaration --allowJs --emitDeclarationOnly src/loader.js

const baseURL = pathToFileURL(`${cwd()}/`).href;

const fileExists = (/** @type {import("fs").PathLike} */ path) =>
  stat(path).then(
    () => true,
    () => false
  );

/**
 * @param {{ parentURL: any; }} context
 * @param {{ (specifier: any, context: any, defaultResolve: any): { url: string; }; (arg0: string, arg1: any, arg2: any): any; }} defaultResolve
 */
export async function resolve(
  /** @type {string} */ specifier,
  context,
  defaultResolve
) {
  let newSpecifier = specifier.replace(/\.js$/, ".ts");

  if (newSpecifier.startsWith("file://")) {
    newSpecifier = fileURLToPath(newSpecifier);
  }

  const { parentURL = baseURL } = context;

  const targetUrl = new URL(newSpecifier, parentURL);

  //console.log("target:", targetUrl.href);

  if (
    targetUrl.href.startsWith("file://") &&
    (await fileExists(fileURLToPath(targetUrl.href)))
  ) {
    return {
      url: targetUrl.href,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

/**
 * @param {string} url
 * @param {undefined} context
 * @param {{ (url: string): Promise<{ source: string; }>; (arg0: any, arg1: any, arg2: any): PromiseLike<{ source: any; }> | { source: any; }; }} defaultLoad
 * @returns {Promise<{ format: "module"; source: string; }>}
 */
export async function load(url, context, defaultLoad) {
  if (/\.ts$/.test(url)) {
    //console.log("a")
    const { source: rawSource } = await defaultLoad(
      url,
      { format: "module" },
      defaultLoad
    );
    //console.log(rawSource)
    const transformedSource = (
      await esbuild.transform(rawSource.toString(), {
        format: "esm",
        loader: "ts",
        sourcemap: "inline",
        sourcefile: url,
      })
    ).code;

    return {
      format: "module",
      source: transformedSource,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
