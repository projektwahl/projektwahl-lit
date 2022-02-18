import { exec as unpromisifiedExec } from "child_process";
import { createHash } from "crypto";
import { readFile, rename, writeFile } from "fs/promises";
import { promisify } from "util";

const exec = promisify(unpromisifiedExec);

{
  let { stdout, stderr } = await exec(
    "lit-localize build"
  );

  console.log(stdout);
  console.log(stderr);
}

{
  let { stdout, stderr } = await exec(
    "esbuild --format=esm --bundle dist/de/client/pw-app.js --charset=utf8 --define:window.PRODUCTION=true --entry-names=[dir]/[name] --sourcemap  --analyze --outdir=dist --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify"
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
    `esbuild --format=esm --bundle dist/de/client/pw-app.js --charset=utf8 --define:window.PRODUCTION=true --define:window.BOOTSTRAP_CSS=\\"dist/bootstrap_${bootstrapHash}.min.css\\" --entry-names=[dir]/[name] --sourcemap  --analyze --outdir=dist --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify`
  );

  console.log(stdout);
  console.log(stderr);
}

let pwAppContents = await readFile("dist/pw-app.js", "utf8");

let pwAppHash = createHash("sha256").update(pwAppContents).digest("hex");

console.log(pwAppHash);

await rename("dist/pw-app.js", `dist/pw-app_${pwAppHash}.js`);

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
  </head>
  <body style="height: 100vh;">
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
  let { stdout, stderr } = await exec(
    `esbuild --platform=node --format=cjs --bundle src/server/setup.ts --external:@dev.mohe/argon2 --define:process.env.NODE_ENV=\\"production\\"  --charset=utf8 --entry-names=[dir]/[name] --sourcemap --analyze --outfile=dist/setup.cjs`
  );
  //  --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify

  console.log(stdout);
  console.log(stderr);
}

{
  let { stdout, stderr } = await exec(
    `esbuild --platform=node --format=cjs --bundle src/server/index.ts --external:@dev.mohe/argon2 --external:esbuild --define:process.env.NODE_ENV=\\"production\\" --charset=utf8 --entry-names=[dir]/[name] --sourcemap --analyze --outfile=dist/server.cjs`
  );
  // --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify

  console.log(stdout);
  console.log(stderr);
}
