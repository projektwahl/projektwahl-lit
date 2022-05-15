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
import { exec as unpromisifiedExec } from "child_process";
import { createHash } from "crypto";
import { readFile, rename, writeFile } from "fs/promises";
import { promisify } from "util";
import "./require-shim.js";
import { build } from "esbuild";

/** @type import("esbuild").Plugin */
const nativeNodeModulesPlugin = {
  name: "native-node-modules",
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: "file" }, (args) => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: "node-file",
    }));

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: "node-file" }, (args) => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }));

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: "node-file" }, (args) => ({
      path: args.path,
      namespace: "file",
    }));

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader[".node"] = "file";
  },
};

const exec = promisify(unpromisifiedExec);

let version_full = (
  await exec("git rev-parse HEAD || echo NOVERSION")
).stdout.trim();

let version_short = (
  await exec("git rev-parse --short HEAD || echo NOVERSION")
).stdout.trim();

{
  let { stdout, stderr } = await exec(
    `esbuild --target=es2020,chrome58,firefox57,safari11 --format=esm --bundle ./src/client/pw-app.js --charset=utf8 --define:window.PRODUCTION=true --define:window.LANGUAGE=\\"${
      process.env.LANGUAGE ?? "de"
    }\\" --define:window.VERSION_FULL=\\"${version_full}\\" --define:window.VERSION_SHORT=\\"${version_short}\\" --entry-names=[dir]/[name] --sourcemap  --analyze --outdir=dist --tree-shaking=true`
  );

  console.log(stdout);
  console.log(stderr);
}

{
  let { stdout, stderr } = await exec(
    "cat node_modules/bootstrap/dist/css/bootstrap.css src/client/main.css > dist/main.css"
  );

  console.log(stdout);
  console.log(stderr);
}

{
  let { stdout, stderr } = await exec(
    "purgecss --css dist/main.css --content dist/pw-app.js --output dist/main.min.css --font-face --keyframes --variables"
  );

  console.log(stdout);
  console.log(stderr);
}

let mainCssContents = await readFile("dist/main.min.css", "utf8");

let mainCssHash = createHash("sha256").update(mainCssContents).digest("hex");

console.log(mainCssHash);

await rename("dist/main.min.css", `dist/main_${mainCssHash}.min.css`);

let pwAppContents = await readFile("dist/pw-app.js", "utf8");

let pwAppHash = createHash("sha256").update(pwAppContents).digest("hex");

console.log(pwAppHash);

await rename("dist/pw-app.js", `dist/pw-app_${pwAppHash}.js`);

{
  let { stdout, stderr } = await exec("cp -r favicon/* dist/");

  console.log(stdout);
  console.log(stderr);
}

const index = `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
    <link rel="stylesheet" href="/dist/main_${mainCssHash}.min.css">
    
    <title>Projektwahl</title>

    <link rel="apple-touch-icon" sizes="180x180" href="/dist/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/dist/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/dist/favicon-16x16.png">
    <link rel="manifest" href="/dist/site.webmanifest">
  </head>
  <body class="height-100">
    <script src="/src/client/polyfill.js">
    </script>
    <script
      type="module"
      src="/dist/pw-app_${pwAppHash}.js"
    ></script>
    <noscript>Bitte aktiviere JavaScript!</noscript>

    <pw-app></pw-app>
  </body>
</html>
`;

await writeFile("dist/index.html", index);

{
  await build({
    platform: "node",
    format: "esm",
    bundle: true,
    entryPoints: ["src/server/setup.ts"],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    external: ["@dev.mohe/argon2"],
    charset: "utf8",
    sourcemap: true,
    outfile: "dist/setup.js",
    inject: ["./require-shim.js"],
    treeShaking: true,
    plugins: [nativeNodeModulesPlugin],
  });
}

{
  await build({
    platform: "node",
    format: "esm",
    bundle: true,
    entryPoints: ["src/server/index.ts"],
    external: ["@dev.mohe/argon2"],
    charset: "utf8",
    sourcemap: true,
    outfile: "dist/server.js",
    inject: ["./require-shim.js"],
    treeShaking: true,
    plugins: [nativeNodeModulesPlugin],
  });
}

{
  await build({
    platform: "node",
    format: "esm",
    bundle: true,
    entryPoints: ["tests/e2e/api-tests.ts"],
    charset: "utf8",
    sourcemap: true,
    outfile: "dist/api-tests.js",
    treeShaking: true,
  });
}
