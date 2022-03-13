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

{
  let { stdout, stderr } = await exec(
    "esbuild --format=esm --bundle ./src/client/pw-app.js --charset=utf8 --define:window.PRODUCTION=true --define:window.LANGUAGE=de --entry-names=[dir]/[name] --sourcemap  --analyze --outdir=dist --tree-shaking=true"
  );

  console.log(stdout);
  console.log(stderr);
}

{
  let { stdout, stderr } = await exec(
    "cp node_modules/bootstrap/dist/css/bootstrap.css.map dist/"
  );

  console.log(stdout);
  console.log(stderr);
}

{
  let { stdout, stderr } = await exec(
    "purgecss --css node_modules/bootstrap/dist/css/bootstrap.css --content dist/*.js --output dist/bootstrap.min.css --font-face --keyframes --variables"
  );

  console.log(stdout);
  console.log(stderr);
}

let bootstrapContents = await readFile("dist/bootstrap.min.css", "utf8");

let bootstrapHash = createHash("sha256")
  .update(bootstrapContents)
  .digest("hex");

console.log(bootstrapHash);

await rename(
  "dist/bootstrap.min.css",
  `dist/bootstrap_${bootstrapHash}.min.css`
);

// rebuild with path to bootstrap.css
{
  let { stdout, stderr } = await exec(
    `esbuild --format=esm --bundle ./src/client/pw-app.js --charset=utf8 --define:window.PRODUCTION=true --define:window.LANGUAGE=de --define:window.BOOTSTRAP_CSS=\\"/dist/bootstrap_${bootstrapHash}.min.css\\" --entry-names=[dir]/[name] --sourcemap --analyze --outdir=dist --tree-shaking=true`
  );

  console.log(stdout);
  console.log(stderr);
}

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
    <style>
      body {
        overflow-y: scroll;
      }
    </style>
    <link
      href="/dist/bootstrap_${bootstrapHash}.min.css"
      rel="stylesheet"
    />
    
    <title>Projektwahl</title>

    <link rel="apple-touch-icon" sizes="180x180" href="/dist/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/dist/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/dist/favicon-16x16.png">
    <link rel="manifest" href="/dist/site.webmanifest">
  </head>
  <body style="height: 100vh;">
    <script
      type="module"
      src="/dist/pw-app_${pwAppHash}.js"
    ></script>
    <noscript>Bitte aktiviere JavaScript!</noscript>

    <pw-app>
    
    <div
    style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1337;"
  >
    <div
        class="spinner-grow text-primary"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
  </div>
    
    </pw-app>
  </body>
</html>
`;

await writeFile("dist/index.html", index);

{
  let { stdout, stderr } = await exec(
    `esbuild --platform=node --format=cjs --bundle src/server/setup.ts --external:@dev.mohe/argon2 --define:process.env.NODE_ENV=\\"production\\"  --charset=utf8 --entry-names=[dir]/[name] --sourcemap --analyze --outfile=dist/setup.cjs --tree-shaking=true`
  );

  console.log(stdout);
  console.log(stderr);
}

{
  /*
  let { stdout, stderr } = await exec(
    `esbuild --platform=node --format=esm --bundle src/server/index.ts --external:@dev.mohe/argon2/build/Release/argon2.node --define:process.env.NODE_ENV=\\"production\\" --charset=utf8 --entry-names=[dir]/[name] --sourcemap --analyze --outfile=dist/server.js --inject:./require-shim.js --tree-shaking=true --loader:.node=./esbuild-plugin-node-extension.js`
  );

  console.log(stdout);
  console.log(stderr);
  */

  await build({
    platform: "node",
    format: "esm",
    bundle: true,
    entryPoints: ["src/server/index.ts"],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    charset: "utf8",
    sourcemap: true,
    outfile: "dist/server.js",
    inject: ["./require-shim.js"],
    treeShaking: true,
    plugins: [nativeNodeModulesPlugin],
  });
}
